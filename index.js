const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_ice_cream_db');
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

// READ / GET - All
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            SELECT * FROM flavors;
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch(error) {
        next(error);
    };
});

// READ / GET - Single, by ID
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            SELECT * FROM flavors
            WHERE id = $1;
        `;
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows);
    } catch(error) {
        next(error);
    };
});

// CREATE / POST
app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO flavors(name, is_favorite)
            VALUES($1, $2)
            RETURNING *;
        `;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite]);
        res.send(response.rows[0]);
    } catch(error) {
        next(error);
    };
});

// UPDATE / PUT
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            UPDATE flavors
            SET name = $1, is_favorite = $2, updated_at = now()
            WHERE id=$3 RETURNING *;
        `;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id]);
        res.send(response.rows);
    } catch(error) {
        next(error);
    };
});

// DELETE
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
            DELETE FROM flavors
            WHERE id = $1;
        `;
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204);
    } catch(error) {
        next(error);
    };
});

// Init function
const init = async () => {
    // Database connection
    await client.connect();
    console.log('Connection succeeded');
    
    // Creating tables
    let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        );
    `;
    await client.query(SQL);
    console.log('Table created');
    
    // Seeding data
    SQL = `
        INSERT INTO flavors(name, is_favorite) VALUES('vanilla', true);
        INSERT INTO flavors(name, is_favorite) VALUES('chocolate', false);
        INSERT INTO flavors(name) VALUES('cookie dough');
    `;
    await client.query(SQL);
    console.log('Table populated');

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  };
  
  init();
