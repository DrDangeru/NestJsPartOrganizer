// src/database/database.service.ts
import * as Database from 'better-sqlite3';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import { Part } from 'src/inventory/types/inventory.types';
import { Location } from 'src/inventory/types/inventory.types'; 

@Injectable()
export class DatabaseService implements OnModuleInit {
    private db: Database.Database;

    constructor() {
        this.db = new Database(join(__dirname, '../../data/parts.db'));
    }

    private generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    onModuleInit() {
        interface TableColumnInfo {
            cid: number;
            name: string;
            type: string;
            notnull: number;
            dflt_value: any;
            pk: number;
        }

        try {
            // Drop existing locations table
            // this.db.exec('DROP TABLE IF EXISTS locations;');
            //  should not be needed if the table exists
            // Create tables if they don't exist
            this.db.exec(`
                DROP TABLE IF EXISTS parts;
                CREATE TABLE parts (
                    partId TEXT PRIMARY KEY,
                    partName TEXT NOT NULL,
                    type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    dateAdded TEXT NOT NULL,
                    currentLoan TEXT,
                    quantity INTEGER DEFAULT 1,
                    manufacturer TEXT,
                    model TEXT,
                    locationId TEXT,
                    container TEXT,
                    row INTEGER,
                    position TEXT,
                    FOREIGN KEY (locationId) REFERENCES locations(locationId)
                );

                DROP TABLE IF EXISTS locations;
                CREATE TABLE locations (
                    locationId TEXT PRIMARY KEY,
                    locationName TEXT NOT NULL,
                    container TEXT,
                    row INTEGER,
                    position TEXT
                );
            `);
            
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    // Parts operations
    getAllParts() {
        try {
            const parts = this.db.prepare(`
                SELECT * 
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
            const stmt = this.db.prepare(`
                INSERT INTO locations (locationId, locationName, container, row, position)
                VALUES (?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
                location.locationId || this.generateId('loc'),
                location.locationName,
                location.container || null,
                location.row || null,
                location.position || null
            );
            if (result.changes !== 1) {
                throw new Error('Failed to create location');
            }
            return location;
        } catch (error) {
            console.error('Error creating location:', error);
            throw error;
        }
    }
            
    getPart(partName: string) {
        try {
            const part = this.db.prepare(`
                SELECT * 
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

    createPart(part: Part) {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO parts (partId, partName, type, status, dateAdded, quantity, locationId, container, row, position)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            // Validate required fields
            if (!part.partName || !part.type) {
                throw new Error('Missing required fields for part creation');
            }

            const result = stmt.run(
                part.partId || this.generateId('part'),
                part.partName,
                part.type,
                part.status || 'available',
                part.dateAdded || new Date().toISOString(),
                part.quantity || 1,
                part.locationId || null,
                part.container || null,
                part.row || null,
                part.position || null
            );

            if (result.changes !== 1) {
                throw new Error('Failed to create part');
            }

            return { ...part, partId: result.lastInsertRowid };
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
        const stmt = this.db.prepare(`UPDATE parts SET ${sets} WHERE partName = ?`);
        stmt.run(...values, partName);
        return this.getPart(partName);
    }

    findPartsByLocation(locationName: string) {
        return this.db.prepare(`
            SELECT p.* 
            FROM parts p
            JOIN locations l ON p.locationId = l.locationId
            WHERE l.locationName = ?
            ORDER BY p.partName`).all(locationName);
    }

    findPartsByType(type: string) {
        return this.db.prepare('SELECT * FROM parts WHERE type = ?').all(type);
    }

    findPartsByStatus(status: string) {
        return this.db.prepare('SELECT * FROM parts WHERE status = ?').all(status);
    }

    deletePart(partName: string) {
        try {
            const result = this.db.prepare('DELETE FROM parts WHERE partName = ?').run(partName);
            if (result.changes === 0) {
                throw new Error(`Part with name ${partName} not found`);
            }
            return result;
        } catch (error) {
            console.error('Error deleting part:', error);
            throw error;
        }
    }

    showLocations() {
        return this.db.prepare('SELECT * FROM locations').all();
    }
}