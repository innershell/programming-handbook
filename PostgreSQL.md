# References
* [PostgreSQL Documentation](https://www.postgresql.org/docs/current/index.html)

# Cheatsheet
## Comments
```
/***
  * THIS IS A BLOCK COMMENT
  */
```

```
-------------------------------
-- THIS IS AN INLINE COMMENT
-------------------------------
```

## Console Output
To print [errors or messages](https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html) to the execution console.
`RAISE NOTICE 'SQL: %', sql;`

## Tables
### Describe
The definition of a table is stored in a `column` view in the `information_schema`. Records from the `column` view will give you everything you need.

The basic query for all table attribues.
```
SELECT * FROM information_schema.columns WHERE table_name = 'your_table_name';
```

A more useful query to describe the table.
```
SELECT column_name, data_type, character_maximum_length FROM information_schema. columns WHERE table_name = 'your_table_name';
```



## Views
### Drop
```
DROP VIEW v_tenant_user;
```

### Create
```
CREATE OR REPLACE VIEW v_tenant_user 
WITH (security_invoker=true)
AS
SELECT
  tenant_user.tenant_id,
  user_profile.*,
  ARRAY(
    SELECT role.name
    FROM public.role, public.user_role
    WHERE 
      role.id = user_role."roleId"
      AND user_role."userId" = tenant_user.user_id
  ) as roles
FROM
  public.tenant_user,
  public.user_profile
WHERE
  tenant_user.user_id = user_profile.user_id;
```

## Functions
### Stored Procedures
```
CREATE
OR REPLACE FUNCTION auth.has_role (i_role_name text) RETURNS boolean AS $$
DECLARE
  user_roles jsonb := public.get_my_claim('roles');
  role jsonb;
BEGIN
  FOR role IN SELECT jsonb_array_elements(user_roles)
  LOOP
    IF (role->>'name') = i_role_name THEN return true; END IF;
  END LOOP;
  RETURN false;
END;
$$ LANGUAGE plpgsql;
```

### Anonymous Functions
Sometimes, you need 
```
CREATE FUNCTION pg_temp.query (OUT result boolean) AS
$$
DECLARE
  -- Declarations
BEGIN
  -- Body
  return true;
END
$$ LANGUAGE plpgsql;

select pg_temp.query() as result;
```

### Anonymous Code Block
Use an [anonymous code block](https://www.postgresql.org/docs/current/sql-do.html) along with the [temporary parameter](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-TEMPORARY) to execute an arbitrary code.
```
DO LANGUAGE plpgsql $$ DECLARE
BEGIN
execute '
create temporary table t
as
SELECT NOW()
';
END $$;

select * from t;
```

### Dollar-Quoted String Constants
The body of a function is a string literal. [Dollar-quoting](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING) is a PostgreSQL-specific alternative for single quotes to avoid escapting of nested single quotes. If you had used single quotes for the function body, you'd also have to escape all nested single quotes.

Instead of this...
```
CREATE OR REPLACE FUNCTION check_phone_number(text)
  RETURNS boolean
  LANGUAGE plpgsql STRICT IMMUTABLE AS
'
BEGIN
  IF NOT $1 ~  e''^\\+\\d{3}\\ \\d{3} \\d{3} \\d{3}$'' THEN
    RAISE EXCEPTION ''Malformed string: "%". Expected format is +999 999'', $1;
  END IF;
  RETURN true; 
END
';
```

You could do this...
```
CREATE OR REPLACE FUNCTION check_phone_number(text)
  RETURNS boolean  
  LANGUAGE plpgsql STRICT IMMUTABLE AS
$func$
BEGIN
 ...
END
$func$;
```

## Triggers
### Drop
```
DROP TRIGGER
  IF EXISTS on_auth_users_insert on auth.users;
```

### Create
```
CREATE TRIGGER
  on_auth_users_insert
AFTER
  INSERT ON auth.users FOR EACH ROW
EXECUTE
  PROCEDURE insert_tenant_user ();
```

# Data Types
These are the most commonly used [data types](https://www.postgresql.org/docs/current/datatype.html):
* integer
* numeric
* text
* boolean
* date
* uuid
* jsonb

## Casting
```
DECLARE
  num_str string;
  num_int int;
BEGIN
  num_int := CAST(num_str AS numeric);
  num_int := num_str::numeric;
```

# JSON Functions and Operations
| Operator | Description |
|----------|-------------|
|`->'text'`|Extracts the object with the given 'key'.|
|`->>'text'`|Extracts the object with the given 'key'. Result returned as a text datatype.|
|`->integer`|Extracts the n'th element of a zero-indexed JSON arrray. Negative integers count from the end of the array.|
|`#>text[]`|Extracts the object at the specified path supplied as an array of either keys (text) or indexes (number).|
|`#>>text[]`|Extracts the object at the specified path supplied as an array of either keys (text) or indexes (number). Result returned as a text datatype.|
