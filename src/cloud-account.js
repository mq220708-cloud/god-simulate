(function(){
'use strict';
const CONFIG=window.THAN_GIOI_CLOUD_CONFIG||{},BUCKET='world-saves',VERSION='1.6.3',SAVE_KEY='than-gioi-save',BACKUP_KEY='than-gioi-save-before-cloud-restore';
let client=null,user=null,ready=false;
const $=s=>document.querySelector(s);
function panel(){
 const lobby=$('#lobby .lbox');if(!lobby||$('#tg-account'))return;
 const style=document.createElement('style');
 style.textContent='#tg-account{margin:16px auto 0;width:min(100%,440px);padding:13px;border:1px solid rgba(160,180,200,.35);border-radius:14px;background:rgba(15,28,43,.82);color:#edf4fb;text-align:left}#tg-account .tg-account-head{display:flex;align-items:center;gap:10px}#tg-account .tg-avatar{width:38px;height:38px;border-radius:50%;background:#30465b;object-fit:cover;display:grid;place-items:center;font-size:19px;flex:none}#tg-account .tg-account-meta{min-width:0;flex:1}#tg-account .tg-account-meta b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#tg-account small{color:#afbdcb}#tg-account .tg-account-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}#tg-account button{border:1px solid #61778c;border-radius:9px;padding:7px 10px;background:#243b52;color:#f4f8fc;font:inherit;font-size:13px}#tg-account button.primary{background:#e8f0fa;color:#17283a;border-color:#e8f0fa;font-weight:650}#tg-account button:disabled{opacity:.5}#tg-account .tg-account-status{font-size:12px;color:#b8c6d3;margin-top:7px;line-height:1.4}#tg-account .tg-save-list{display:grid;gap:6px;margin-top:9px}#tg-account .tg-save-item{display:flex;align-items:center;gap:8px;padding:7px;border:1px solid #40576d;border-radius:8px}#tg-account .tg-save-item span{flex:1;min-width:0;font-size:12px}#tg-account .tg-save-item button{padding:4px 8px}#tg-account .tg-save-item .tg-delete{border-color:#87534f;background:#4a2929}#tg-account .tg-save-item .tg-rename{background:#304b63}#tg-account .tg-account-error{color:#ffb4a9}';
 document.head.appendChild(style);
 const root=document.createElement('section');root.id='tg-account';
 root.innerHTML='<div class="tg-account-head"><div class="tg-avatar" id="tg-avatar">👤</div><div class="tg-account-meta"><b id="tg-account-name">Tài khoản Thần Giới</b><small id="tg-account-caption">Đăng nhập để đồng bộ bản đồ và thành tích</small></div></div><div class="tg-account-actions"><button class="primary" id="tg-google-login">🌐 Đăng nhập bằng Google</button><button id="tg-account-logout" hidden>Đăng xuất</button><button id="tg-cloud-list" hidden>☁ Bản đồ đám mây</button></div><div class="tg-account-status" id="tg-account-status">Bản đồ vẫn được lưu trên thiết bị. Đăng nhập Google để bật đồng bộ đám mây.</div><div class="tg-save-list" id="tg-save-list" hidden></div>';
 lobby.appendChild(root);
 const board=document.createElement('section');board.id='tg-leaderboard';board.innerHTML='<div class="tg-lb-head"><b>🏆 Bảng xếp hạng online</b><button type="button" id="tg-lb-refresh">↻ Làm mới</button></div><div class="tg-lb-note">Xếp hạng theo điểm văn minh của thế giới đã đồng bộ. Chỉ hiển thị tên công khai, không hiển thị email.</div><div class="tg-lb-list" id="tg-lb-list">Đang chờ kết nối dịch vụ…</div>';document.querySelector('#lobby').appendChild(board);$('#tg-lb-refresh').addEventListener('click',listLeaderboard);listLeaderboard();
 $('#tg-google-login').addEventListener('click',login);$('#tg-account-logout').addEventListener('click',logout);$('#tg-cloud-list').addEventListener('click',listSaves);
 if(!configured()){$('#tg-google-login').disabled=true;status('Chưa cấu hình dịch vụ tài khoản. Quản trị viên cần thêm Supabase URL và anon key trong src/cloud-config.js. Lưu cục bộ vẫn hoạt động bình thường.')}
}
function configured(){return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(CONFIG.supabaseUrl||'')&&!!CONFIG.supabaseAnonKey}
function status(message,error){const el=$('#tg-account-status');if(el){el.textContent=message;el.classList.toggle('tg-account-error',!!error)}}
function render(){
 const loginButton=$('#tg-google-login');if(!loginButton)return;
 $('#tg-account-logout').hidden=!user;$('#tg-cloud-list').hidden=!user;loginButton.hidden=!!user;
 $('#tg-account-name').textContent=user&&(user.user_metadata?.full_name||user.user_metadata?.name||user.email)||'Tài khoản Thần Giới';
 $('#tg-account-caption').textContent=user?(user.email||'Đã đăng nhập Google'):'Đăng nhập để đồng bộ bản đồ và thành tích';
 const old=$('#tg-avatar');
 if(user?.user_metadata?.avatar_url){const img=document.createElement('img');img.src=user.user_metadata.avatar_url;img.alt='';img.className='tg-avatar';img.id='tg-avatar';old.replaceWith(img)}
 else if(old.tagName==='IMG'){const div=document.createElement('div');div.id='tg-avatar';div.className='tg-avatar';div.textContent='👤';old.replaceWith(div)}
}
async function init(){
 panel();if(!configured())return;
 try{
  if(!window.supabase)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được thư viện đăng nhập'));document.head.appendChild(s)});
  client=window.supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const result=await client.auth.getSession();if(result.error)throw result.error;
  user=result.data.session?.user||null;ready=true;render();listLeaderboard();
  client.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;render();status(user?'Đã đăng nhập. Tự động đồng bộ sẽ diễn ra sau mỗi 3 tháng trong game.':'Đã đăng xuất. Bản lưu trên thiết bị không bị ảnh hưởng.');if(user)setTimeout(()=>{try{const snapshot=window.ThanhGioiCreateSaveSnapshot?.();if(snapshot)saveWorld(snapshot);else{const raw=localStorage.getItem(SAVE_KEY);if(raw)saveWorld(JSON.parse(raw))}}catch(e){console.warn('Initial cloud sync skipped:',e)}},1500)});
  if(user)status('Đã đăng nhập. Bản đồ cục bộ vẫn được giữ nguyên.');
 }catch(e){status('Không thể khởi tạo tài khoản: '+(e.message||e),true)}
}
async function login(){if(!client)return;try{const r=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href,queryParams:{access_type:'offline',prompt:'consent'}}});if(r.error)throw r.error}catch(e){status('Đăng nhập Google thất bại: '+e.message,true)}}
async function logout(){if(!client)return;try{const r=await client.auth.signOut();if(r.error)throw r.error;$('#tg-save-list').hidden=true;status('Đã đăng xuất. Bản lưu trên thiết bị vẫn an toàn.')}catch(e){status('Không thể đăng xuất: '+e.message,true)}}
function worldId(save){if(!save.W.cloudId)save.W.cloudId=save.W.id||save.W.worldId||(window.crypto&&crypto.randomUUID?crypto.randomUUID():'world-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));return save.W.cloudId}
function worldName(save){return save?.W?.name||('Thế giới năm '+(save?.W?.year??0))}
async function saveWorld(save){
 if(!client||!user||!save)return {ok:false,reason:'not-authenticated'};
 try{
  const id=worldId(save),path=user.id+'/'+id+'.json',blob=new Blob([JSON.stringify(save)],{type:'application/json'});localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  const up=await client.storage.from(BUCKET).upload(path,blob,{upsert:true,contentType:'application/json'});if(up.error)throw up.error;
  const db=await client.from('world_saves').upsert({user_id:user.id,world_id:id,world_name:worldName(save),game_version:VERSION,storage_path:path,updated_at:new Date().toISOString()},{onConflict:'user_id,world_id'});if(db.error)throw db.error;
  let leaderboardUpdated=false;try{await updateLeaderboard(save);leaderboardUpdated=true}catch(lbError){console.warn('Leaderboard update failed:',lbError)}
  status(leaderboardUpdated?'☁ Đã đồng bộ "'+worldName(save)+'" và cập nhật bảng xếp hạng.':'☁ Đã đồng bộ bản đồ; bảng xếp hạng chưa cập nhật (kiểm tra schema Supabase).');return {ok:true,leaderboardUpdated};
 }catch(e){status('Lưu đám mây thất bại: '+e.message+'. Bản trên thiết bị vẫn được giữ.',true);return {ok:false,error:e.message}}
}
function leaderboardStats(save){
 const kingdoms=Array.isArray(save?.W?.ks)?save.W.ks.filter(k=>k&&k.alive):[];
 const population=Math.round(kingdoms.reduce((sum,k)=>sum+(Number(k.pop)||0),0));
 const technology=Number(Math.max(0,...kingdoms.map(k=>Number(k.tech)||0)).toFixed(2));
 const year=Math.max(0,Math.floor(Number(save?.W?.year)||0));
 const score=Math.round(population*10+technology*1000+year*5);
 return {population,technology,year,score};
}
async function updateLeaderboard(save){
 if(!client||!user||!save?.W)return;
 const stats=leaderboardStats(save),displayName=String(user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'Người chơi').slice(0,48);
 const record={user_id:user.id,display_name:displayName,world_name:worldName(save).slice(0,80),score:stats.score,world_year:stats.year,population:stats.population,technology:stats.technology,updated_at:new Date().toISOString()};
 const r=await client.from('leaderboard').upsert(record,{onConflict:'user_id'});if(r.error)throw r.error;
 await listLeaderboard();
}
async function listLeaderboard(){
 const list=$('#tg-lb-list');if(!list)return;
 if(!client){list.textContent=configured()?'Đang kết nối bảng xếp hạng…':'Bảng xếp hạng sẽ hoạt động sau khi cấu hình Supabase.';return}
 list.textContent='Đang tải bảng xếp hạng…';
 try{
  const r=await client.from('leaderboard').select('display_name,world_name,score,world_year,population,technology,updated_at').order('score',{ascending:false}).limit(20);if(r.error)throw r.error;
  list.innerHTML='';
  if(!r.data?.length){list.textContent='Chưa có thành tích nào. Hãy đăng nhập Google và đồng bộ thế giới đầu tiên!';return}
  r.data.forEach((item,index)=>{const row=document.createElement('div');row.className='tg-lb-row';const rank=document.createElement('b');rank.className='tg-lb-rank';rank.textContent=index===0?'🥇':index===1?'🥈':index===2?'🥉':String(index+1);const name=document.createElement('span');name.className='tg-lb-name';name.textContent=item.display_name||'Người chơi';const meta=document.createElement('small');meta.className='tg-lb-meta';meta.textContent=(item.world_name||'Thế giới')+' · Năm '+(item.world_year||0)+' · Dân số '+Number(item.population||0).toLocaleString('vi-VN')+' · CN '+(item.technology||0);name.appendChild(meta);const score=document.createElement('b');score.className='tg-lb-score';score.textContent=Number(item.score||0).toLocaleString('vi-VN')+' điểm';row.append(rank,name,score);list.appendChild(row)});
 }catch(e){list.textContent='Không tải được bảng xếp hạng. Hãy kiểm tra bảng leaderboard trong Supabase.'}
}
async function listSaves(){
 if(!client||!user)return;const list=$('#tg-save-list');list.hidden=false;list.textContent='Đang tải danh sách bản đồ…';
 try{
  const r=await client.from('world_saves').select('world_id,world_name,game_version,updated_at,storage_path').eq('user_id',user.id).order('updated_at',{ascending:false});if(r.error)throw r.error;
  list.innerHTML='';if(!r.data?.length){list.textContent='Chưa có bản đồ nào được lưu trên đám mây.';return}
  r.data.forEach(item=>{const row=document.createElement('div');row.className='tg-save-item';const info=document.createElement('span');info.textContent=item.world_name+' · v'+item.game_version+' · '+new Date(item.updated_at).toLocaleString('vi-VN');const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;flex-wrap:wrap';const button=document.createElement('button');button.textContent='Tải';button.addEventListener('click',()=>loadSave(item));const rename=document.createElement('button');rename.className='tg-rename';rename.textContent='Đổi tên';rename.addEventListener('click',()=>renameSave(item));const remove=document.createElement('button');remove.className='tg-delete';remove.textContent='Xóa';remove.addEventListener('click',()=>deleteSave(item));actions.append(button,rename,remove);row.append(info,actions);list.appendChild(row)});
 }catch(e){list.textContent='Không tải được danh sách: '+e.message;status('Kiểm tra cấu hình bảng world_saves và Storage bucket.',true)}
}
async function renameSave(item){
 const next=window.prompt('Tên mới cho thế giới:',item.world_name||'Thế giới');if(next===null)return;
 const name=next.trim().slice(0,80);if(!name){status('Tên thế giới không được để trống.',true);return}
 try{const file=await client.storage.from(BUCKET).download(item.storage_path);if(file.error)throw file.error;const save=JSON.parse(await file.data.text());if(!save.W)throw new Error('Bản đồ không có dữ liệu thế giới');save.W.name=name;const upload=await client.storage.from(BUCKET).upload(item.storage_path,new Blob([JSON.stringify(save)],{type:'application/json'}),{upsert:true,contentType:'application/json'});if(upload.error)throw upload.error;const r=await client.from('world_saves').update({world_name:name,updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('world_id',item.world_id);if(r.error)throw r.error;status('Đã đổi tên thế giới thành "'+name+'".');await listSaves()}catch(e){status('Không thể đổi tên: '+e.message,true)}
}
async function deleteSave(item){
 if(!window.confirm('Xóa vĩnh viễn bản đồ "'+(item.world_name||'Thế giới')+'" khỏi đám mây?'))return;
 try{const file=await client.storage.from(BUCKET).remove([item.storage_path]);if(file.error)throw file.error;const row=await client.from('world_saves').delete().eq('user_id',user.id).eq('world_id',item.world_id);if(row.error)throw row.error;status('Đã xóa bản đồ "'+item.world_name+'".');await listSaves()}catch(e){status('Không thể xóa bản đồ: '+e.message,true)}
}
async function loadSave(item){
 if(!client||!user)return;
 try{const r=await client.storage.from(BUCKET).download(item.storage_path);if(r.error)throw r.error;const save=JSON.parse(await r.data.text());if(!save||!Array.isArray(save.T)||!Array.isArray(save.O)||!save.W)throw new Error('Dữ liệu bản đồ không hợp lệ');const current=localStorage.getItem(SAVE_KEY);if(current)localStorage.setItem(BACKUP_KEY,current);localStorage.setItem(SAVE_KEY,JSON.stringify(save));const button=$('#ld');if(!button)throw new Error('Không tìm thấy nút tải bản đồ trong game');button.click();status('Đã tải bản đồ "'+item.world_name+'". Bản lưu trước đó được sao lưu trên thiết bị.')}catch(e){status('Không thể tải bản đồ: '+e.message,true)}
}
window.ThanhGioiCloudAccount={getUser:()=>user,isReady:()=>ready,saveWorld,refreshSaves:listSaves};
document.addEventListener('DOMContentLoaded',init);if(document.readyState!=='loading')init();
document.addEventListener('click',e=>{if(e.target?.id!=='sv')return;setTimeout(()=>{if(!user||!client)return;try{const raw=localStorage.getItem(SAVE_KEY);if(raw)saveWorld(JSON.parse(raw))}catch(err){status('Không thể chuẩn bị bản lưu đám mây: '+err.message,true)}},0)});
})();