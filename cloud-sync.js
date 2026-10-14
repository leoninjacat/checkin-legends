/* Integração opcional: sem configuração, o armazenamento local continua funcionando. */
const LegendsCloud=(()=>{
  let client=null,selected=null;
  const cfg=()=>window.LEGENDS_CLOUD_CONFIG;
  async function connect(){
    const config=cfg();
    if(!config?.url||!config?.anonKey)throw Error('Configure cloud-config.js antes de usar a nuvem.');
    if(!window.supabase?.createClient)throw Error('Biblioteca Supabase indisponível. Verifique a conexão.');
    if(!client)client=window.supabase.createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
    return client;
  }
  async function user(){const c=await connect();const {data,error}=await c.auth.getUser();if(error)throw error;return data.user}
  async function login(email,password){const c=await connect();const {error}=await c.auth.signInWithPassword({email,password});if(error)throw error;return user()}
  async function logout(){const c=await connect();const {error}=await c.auth.signOut();if(error)throw error;selected=null}
  async function list(){const c=await connect();if(!await user())throw Error('Entre com uma conta autorizada.');const {data,error}=await c.from('legends_lists').select('id,name,revision,updated_at').order('updated_at',{ascending:false});if(error)throw error;return data}
  async function open(id){const c=await connect();const {data,error}=await c.from('legends_lists').select('id,name,state,revision').eq('id',id).single();if(error)throw error;selected={id:data.id,revision:data.revision};return data}
  async function save(name,state){
    const c=await connect();if(!await user())throw Error('Faça login para salvar.');
    if(selected){
      const {data,error}=await c.from('legends_lists').update({name,state,revision:selected.revision+1,updated_at:new Date().toISOString()}).eq('id',selected.id).eq('revision',selected.revision).select('id,revision').maybeSingle();
      if(error)throw error;
      if(!data)throw Error('Outra pessoa alterou esta lista. Abra a versão atual antes de salvar para evitar sobrescrever mudanças.');
      selected={id:data.id,revision:data.revision};return data;
    }
    const {data,error}=await c.from('legends_lists').insert({name,state}).select('id,revision').single();
    if(error)throw error;selected={id:data.id,revision:data.revision};return data;
  }
  function clearSelection(){selected=null}
  return {connect,user,login,logout,list,open,save,clearSelection};
})();
