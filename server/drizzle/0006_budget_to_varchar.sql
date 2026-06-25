-- Fix budget column: was decimal but frontend sends range strings like 'under-500', '500-1000'
ALTER TABLE "catering_requests" ALTER COLUMN "budget" TYPE varchar(40) USING budget::varchar(40);

-- Fix email column: make nullable to match the public form where email is optional
ALTER TABLE "catering_requests" ALTER COLUMN "email" DROP NOT NULL;
