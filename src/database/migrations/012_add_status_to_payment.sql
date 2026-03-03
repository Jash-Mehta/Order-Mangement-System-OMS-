-- Add PENDING status to payments table check constraint
-- This allows the payment creation API to accept PENDING status

ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_status_check 
CHECK (status IN (
    'PENDING',
    'CREATED', 
    'AUTHORIZED', 
    'CAPTURED', 
    'FAILED', 
    'REFUNDED'
));
