
-- Create function to get top earners with their JaiCoin balances
CREATE OR REPLACE FUNCTION get_top_earners()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  rank TEXT,
  balance BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.rank,
    COALESCE(
      SUM(CASE WHEN jt.type = 'earned' THEN jt.amount ELSE -jt.amount END),
      0
    ) as balance
  FROM profiles p
  LEFT JOIN jaicoin_transactions jt ON p.id = jt.user_id
  GROUP BY p.id, p.full_name, p.rank
  ORDER BY balance DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
