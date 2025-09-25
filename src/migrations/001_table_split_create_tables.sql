CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    zaddr TEXT,
    -- optional user z-address,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'ZEC',
    invite_code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES users(id) ON DELETE
    SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    username TEXT,
    zaddr TEXT,
    joined_at TIMESTAMP WITh TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);
 CREATE TABLE expenses(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES participants(id),
    amount NUMERIC(18, 8) NOT NULL,
    memo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
