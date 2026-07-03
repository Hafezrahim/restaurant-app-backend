
-- The app uses PostgREST only; disable pg_graphql so tables are not exposed
-- via GraphQL introspection to anon/authenticated roles.
DROP EXTENSION IF EXISTS pg_graphql CASCADE;
