-- AlterTable
CREATE SEQUENCE project_scopes_id_seq;
ALTER TABLE "project_scopes" ALTER COLUMN "id" SET DEFAULT nextval('project_scopes_id_seq');
ALTER SEQUENCE project_scopes_id_seq OWNED BY "project_scopes"."id";
