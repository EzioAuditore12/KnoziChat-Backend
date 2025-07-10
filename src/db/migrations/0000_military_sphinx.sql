CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"done" boolean DEFAULT false,
	"createdAt" time DEFAULT now(),
	"updatedAt" time,
	CONSTRAINT "tasks_id_unique" UNIQUE("id")
);
