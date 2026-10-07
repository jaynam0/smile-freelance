import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mejepolqielkftdskajw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xOy1cSsOQF65XSDjv8GhlA_7cNJZZ-P";

// Custom fetch to properly handle new Supabase publishable keys
function createSupabaseFetch(supabaseKey) {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: {
    fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
  },
});

export const DEFAULT_CREDENTIALS = {
  client: {
    email: "client@test.com",
    password: "TestPassword!2026",
    role: "client",
    name: "Default Client",
  },
  freelancer: {
    email: "freelancer@test.com",
    password: "TestPassword!2026",
    role: "freelancer",
    name: "Default Freelancer",
  },
};

async function verifyAndConfigureUser(account) {
  const { email, password, role, name } = account;
  console.log(`\n--- Testing ${role} account (${email}) ---`);

  // Attempt login
  let { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    console.log(`Sign-in note: ${loginError.message}`);
    console.log(`Attempting sign-up for ${email}...`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (signUpError) {
      console.error(`Sign-up error for ${email}:`, signUpError.message);
    } else {
      console.log(`User signed up! ID: ${signUpData.user?.id}`);
    }

    // Try logging in again after signup
    const retry = await supabase.auth.signInWithPassword({ email, password });
    loginData = retry.data;
    loginError = retry.error;
  }

  if (loginData?.user) {
    console.log(`✓ Successfully authenticated as ${email} (User ID: ${loginData.user.id})`);

    // Verify / assign user role
    const { data: existingRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', loginData.user.id);

    if (checkError) {
      console.warn(`Could not check roles: ${checkError.message}`);
    } else {
      const hasRole = existingRoles?.some((r) => r.role === role);
      if (!hasRole) {
        console.log(`Assigning '${role}' role to user...`);
        const { error: insertError } = await supabase.from('user_roles').insert({
          user_id: loginData.user.id,
          role: role,
        });
        if (insertError) {
          console.error(`Error assigning role: ${insertError.message}`);
        } else {
          console.log(`✓ Assigned role '${role}'`);
        }
      } else {
        console.log(`✓ Role '${role}' is already configured.`);
      }
    }

    await supabase.auth.signOut();
  } else {
    console.log(`ℹ If sign in failed due to email verification, run 'seed_test_users.sql' in your Supabase SQL Editor:`);
    console.log(`  https://supabase.com/dashboard/project/mejepolqielkftdskajw/sql/new`);
  }
}

async function run() {
  console.log("Checking default credentials on Supabase...");
  await verifyAndConfigureUser(DEFAULT_CREDENTIALS.client);
  await verifyAndConfigureUser(DEFAULT_CREDENTIALS.freelancer);
  console.log("\nFinished checking credentials.");
}

run();
