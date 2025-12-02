-- Function to calculate projected balance
-- Returns: current_balance, pending_bills (expenses), projected_balance
CREATE OR REPLACE FUNCTION get_financial_projection(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance NUMERIC;
    pending_bills NUMERIC;
    projected_balance NUMERIC;
    month_end DATE := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
BEGIN
    -- 1. Current Balance (All transactions)
    -- Note: We sum all transactions regardless of date, matching the frontend logic
    SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
    INTO current_balance
    FROM transactions
    WHERE user_id = user_id_param;

    -- 2. Pending Bills (Unpaid bills due up to end of month)
    -- We assume bills are expenses.
    SELECT COALESCE(SUM(amount), 0)
    INTO pending_bills
    FROM bills
    WHERE user_id = user_id_param
    AND is_paid = false
    AND due_date <= month_end;

    -- 3. Projected Balance
    projected_balance := current_balance - pending_bills;

    RETURN json_build_object(
        'current_balance', current_balance,
        'pending_bills', pending_bills,
        'projected_balance', projected_balance,
        'month_end', month_end
    );
END;
$$;
