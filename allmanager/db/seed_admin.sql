-- Substitua {PASSWORD_HASH} pelo hash gerado em db/hash_password.js
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'admin@local', '{PASSWORD_HASH}', 'ADMIN');
