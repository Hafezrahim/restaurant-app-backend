
-- Revoke EXECUTE on SECURITY DEFINER helper functions from public roles.
-- has_role must remain executable by authenticated (used inside RLS policies).
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- Hide the pg_graphql schema from client roles so tables are not discoverable
-- via GraphQL introspection. The app uses PostgREST only.
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated;
