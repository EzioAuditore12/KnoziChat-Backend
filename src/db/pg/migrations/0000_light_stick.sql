CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"middle_name" varchar(50),
	"last_name" varchar(50) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"email" varchar(240),
	"password" text NOT NULL,
	"expoPushToken" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
