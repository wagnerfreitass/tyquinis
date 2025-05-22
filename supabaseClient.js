// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dfgjgqvdprirmsgeegbq.supabase.co'; // ⬅️ Substitua pela URL real do seu projeto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZ2pncXZkcHJpcm1zZ2VlZ2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Mzg4OTAsImV4cCI6MjA2MzQxNDg5MH0.HNrnMQNuPoAMpm-2AbAObq1V-x0wa-iSpGiEuWhc7is';         // ⬅️ Substitua pela sua anon key

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
