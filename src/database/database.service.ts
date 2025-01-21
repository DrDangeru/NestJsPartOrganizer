// src/database/database.service.ts
import * as Database from 'better-sqlite3';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import { Part } from 'src/inventory/types/inventory.types';
import { Location } from 'src/inventory/types/inventory.types';
import { Statement } from 'better-sqlite3';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private db: Database.Database;
    private lastLocationId = 0;
    private lastPartId = 100;  // Start at 100 so first part will be 101

    constructor() {
        this.db = new Database(join(__dirname, '../../data/parts.db'));
    }

    prepare(sql: string): Statement {
        return this.db.prepare(sql);
    }

    private generateId(type: 'location' | 'part'): number {
        if (type === 'location') {
            this.lastLocationId++;
            if (this.lastLocationId > 100) {
                throw new Error('Maximum location ID (100) reached');
            }
            return this.lastLocationId;
        } else {
            this.lastPartId++;
            if (this.lastPartId > 1000000) {
                throw new Error('Maximum part ID (1000000) reached');
            }
            return this.lastPartId;
        }
    }

    async onModuleInit() {
        try {
            // Create tables first
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS locations (
                    locationId INTEGER PRIMARY KEY,
                    locationName TEXT NOT NULL,
                    container TEXT,
                    row INTEGER,
                    position TEXT
                );

                CREATE TABLE IF NOT EXISTS parts (
                    partId INTEGER PRIMARY KEY,
                    partName TEXT NOT NULL,
                    partDescription TEXT,
                    type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    dateAdded TEXT,
                    currentLoan TEXT,
                    quantity INTEGER DEFAULT 1,
                    manufacturer TEXT,
                    model TEXT,
                    locationId INTEGER,
                    container TEXT,
                    row INTEGER,
                    position TEXT,
                    category TEXT,
                    FOREIGN KEY (locationId) REFERENCES locations(locationId)
                );
            `);

            // Initialize last used IDs from database
            const lastLocation = this.prepare('SELECT locationId FROM locations ORDER BY locationId DESC LIMIT 1').get() as { locationId: number } | undefined;
            const lastPart = this.prepare('SELECT partId FROM parts ORDER BY partId DESC LIMIT 1').get() as { partId: number } | undefined;
            
            if (lastLocation) {
                this.lastLocationId = lastLocation.locationId;
            }
            if (lastPart) {
                this.lastPartId = lastPart.partId;
            }

            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    // Parts operations
    getAllParts() {
        try {
            const parts = this.prepare(`
                SELECT partId, partName, partDescription, type, status, dateAdded, 
                       currentLoan, quantity, manufacturer, model,
                       locationId, container, row, position, category
                FROM parts 
                ORDER BY partName`).all();
            return Array.isArray(parts) ? parts : [];
        } catch (error) {
            console.error('Error getting all parts:', error);
            return [];
        }
    }

    createLocation(location: Location) {
        try {
            const locationId = this.generateId('location');
            const stmt = this.prepare(`
                INSERT INTO locations (
                    locationId, locationName, container, row, position
                ) VALUES (?, ?, ?, ?, ?)
            `);

            stmt.run(
                locationId,
                location.locationName,
                location.container || null,
                location.row || null,
                location.position || null
            );

            return { ...location, locationId };
        } catch (error) {
            console.error('Error creating location:', error);
            throw error;
        }
    }
            
    getPart(partName: string) {
        try {
            const part = this.prepare(`
                SELECT partId, partName, partDescription, type, status, dateAdded,
                       currentLoan, quantity, manufacturer, model,
                       locationId, container, row, position, category
                FROM parts 
                WHERE partName = ?`).get(partName);
            if (!part) {
                throw new Error(`Part with name ${partName} not found`);
            }
            return part;
        } catch (error) {
            console.error(`Error getting part ${partName}:`, error);
            throw error;
        }
    }

    getPartById(partId: number ) {
        try {
            const part = this.prepare(`
                SELECT partId, partName, partDescription, type, status, dateAdded,
                       currentLoan, quantity, manufacturer, model,
                       locationId, container, row, position, category
                FROM parts 
                WHERE partId = ?`).get(partId);
            if (!part) {
                throw new Error(`Part with name ${partId} not found`);
            }
            return part;
        } catch (error) {
            console.error(`Error getting part ${partId}:`, error);
            throw error;
        }
    }

    createPart(part: Part) {
        try {
            const partId = part.partId || this.generateId('part');
            let locationId: number | null = null;

            // If locationName is provided, try to find existing location
            if (part.locationName) {
                const existingLocation = this.prepare(
                    'SELECT locationId FROM locations WHERE locationName = ?'
                ).get(part.locationName) as { locationId: number } | undefined;
                
                if (!existingLocation) {
                    throw new Error(`Location "${part.locationName}" does not exist.
                        Please create the location first.`);
                }
                locationId = existingLocation.locationId;
            }

            // Validate that the container exists for this location if provided
            if (locationId && part.container) {
                const existingContainer = this.prepare(
                    'SELECT container FROM locations WHERE locationId = ? AND container = ?'
                ).get(locationId, part.container) as { container: string } | undefined;

                if (!existingContainer) {
                    throw new Error(`Container "${part.container}" does not exist in the specified location. Please create the container first.`);
                }
            }

            const stmt = this.prepare(`
                INSERT INTO parts (
                    partId, partName, partDescription, type, status, dateAdded,
                    currentLoan, quantity, manufacturer, model,
                    locationId, container, row, position, category
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?
                )
                RETURNING *`);

            const result = stmt.get(
                partId,
                part.partName,
                part.partDescription || null,
                part.type,
                part.status,
                part.dateAdded || new Date().toISOString(),
                part.currentLoan || null,
                part.quantity || 1,
                part.manufacturer || null,
                part.model || null,
                locationId,
                part.container || null,
                part.row || null,
                part.position || null,
                part.category || null
            ) as Part;

            return result;
        } catch (error) {
            console.error('Error creating part:', error);
            throw error;
        }
    }

    updatePart(partName: string, data: any) {
        const sets = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = Object.values(data);
        const stmt = this.prepare(`UPDATE parts SET ${sets} WHERE partName = ?`);
        stmt.run(...values, partName);
        return this.getPart(partName);
    }

    findPartsByLocation(locationName: string) {
        return this.prepare(`
            SELECT p.partId, p.partName, p.partDescription, p.type, p.status, p.dateAdded,
                   p.currentLoan, p.quantity, p.manufacturer, p.model,
                   p.locationId, p.container, p.row, p.position, p.category
            FROM parts p
            JOIN locations l ON p.locationId = l.locationId
            WHERE l.locationName = ?
            ORDER BY p.partName`).all(locationName);
    }

    findPartsByType(type: string) {
        return this.prepare(`
            SELECT partId, partName, partDescription, type, status, dateAdded,
                   currentLoan, quantity, manufacturer, model,
                   locationId, container, row, position, category
            FROM parts 
            WHERE type = ?
            ORDER BY partName`).all(type);
    }

    findPartsByStatus(status: string) {
        return this.prepare(`
            SELECT partId, partName, partDescription, type, status, dateAdded,
                   currentLoan, quantity, manufacturer, model,
                   locationId, container, row, position, category
            FROM parts 
            WHERE status = ?
            ORDER BY partName`).all(status);
    }

    deletePart(partName: string) {
        try {
            const result = this.prepare('DELETE FROM parts WHERE partName = ?').run(partName);
            if (result.changes === 0) {
                throw new Error(`Part with name ${partName} not found`);
            }
            return result;
        } catch (error) {
            console.error('Error deleting part:', error);
            throw error;
        }
    }

    deletePartById(partId: number) {
    try {
        const result = this.prepare('DELETE FROM parts WHERE partId = ?').run(partId);
        if (result.changes === 0) {
            throw new Error(`Part with name ${partId} not found`);
        }
        return result;
    } catch (error) {
        console.error('Error deleting part:', error);
        throw error;
    }
}

    showLocations() {
        return this.prepare('SELECT * FROM locations').all();
    }
}