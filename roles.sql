INSERT INTO "Role" (id, name, "updatedAt") VALUES ('1', 'admin', NOW()), ('2', 'company', NOW()), ('3', 'judge', NOW()), ('4', 'student', NOW()) ON CONFLICT DO NOTHING;
