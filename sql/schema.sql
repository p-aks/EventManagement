-- Users table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('organizer', 'attendee')) NOT NULL
);

-- Events table
CREATE TABLE Events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(200),
    organizer_id INT NOT NULL,
    FOREIGN KEY (organizer_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Tickets table
CREATE TABLE Tickets (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    type VARCHAR(10) CHECK (type IN ('free', 'paid')) NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0 CHECK (price >= 0),
    quantity INT CHECK (quantity >= 0),
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE
);

-- RSVPs table
CREATE TABLE RSVPs (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    ticket_id INT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('confirmed', 'cancelled')) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(id) ON DELETE CASCADE,
    UNIQUE (user_id, event_id)  -- Ensures a user can RSVP only once per event
);