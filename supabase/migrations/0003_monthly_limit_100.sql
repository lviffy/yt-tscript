-- Enforce default monthly quota of 100 requests per API key.

alter table public.api_keys
  alter column requests_limit set default 100;

update public.api_keys
set requests_limit = 100
where requests_limit is null or requests_limit <> 100;
