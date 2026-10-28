const grid=document.querySelector('#bookGrid'),search=document.querySelector('#search'),category=document.querySelector('#category'),count=document.querySelector('#count'),empty=document.querySelector('#empty');
let books=[];
function safeURL(value){if(!value)return '';try{const u=new URL(value,location.href);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function render(){const q=search.value.trim().toLocaleLowerCase('th');const filtered=books.filter(b=>(category.value==='all'||b.category===category.value)&&[b.title,b.author,b.description,b.category].some(v=>String(v||'').toLocaleLowerCase('th').includes(q)));grid.replaceChildren();count.textContent=`${filtered.length} รายการ`;empty.hidden=filtered.length!==0;for(const b of filtered){const card=document.createElement('article');card.className='card';const cover=document.createElement('div');cover.className='cover';const inner=document.createElement('div');inner.className='cover-inner';inner.style.setProperty('--cover',/^#[0-9a-f]{6}$/i.test(b.color)?b.color:'#127d83');const name=document.createElement('span');name.textContent=b.title;const subtitle=document.createElement('small');subtitle.textContent='THACHA FREE E-BOOK';inner.append(name,subtitle);cover.append(inner);const body=document.createElement('div');body.className='card-body';const tag=document.createElement('div');tag.className='tag';tag.textContent=b.category;const title=document.createElement('h3');title.textContent=b.title;const author=document.createElement('div');author.className='author';author.textContent=`ผู้เขียน: ${b.author}`;const desc=document.createElement('p');desc.className='desc';desc.textContent=b.description||'';const details=document.createElement('button');details.type='button';details.className='detail-btn';details.textContent='ดูรายละเอียดหนังสือ →';details.addEventListener('click',()=>showDetails(b));const link=document.createElement('div');link.className='read';const url=safeURL(b.file);if(url){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='อ่าน / ดาวน์โหลดฟรี ↗';link.append(a)}else{link.classList.add('disabled');link.textContent='ตัวอย่าง — ยังไม่เปิดให้อ่าน'}body.append(tag,title,author,desc,details,link);card.append(cover,body);grid.append(card)}}
async function init(){try{const r=await fetch('books.json');if(!r.ok)throw Error('โหลดข้อมูลไม่สำเร็จ');const data=await r.json();if(!Array.isArray(data))throw Error('รูปแบบข้อมูลไม่ถูกต้อง');books=data;const categories=[...new Set(books.map(b=>b.category).filter(Boolean))].sort();for(const c of categories){const o=document.createElement('option');o.value=c;o.textContent=c;category.append(o)}render()}catch(e){empty.hidden=false;empty.textContent='ไม่สามารถโหลดรายการหนังสือได้ กรุณาเปิดผ่านเว็บไซต์หรือเซิร์ฟเวอร์ทดสอบ'}}search.addEventListener('input',render);category.addEventListener('change',render);document.querySelector('#year').textContent=new Date().getFullYear();init();

const dialog=document.querySelector('#bookDialog');
document.querySelector('#closeDialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
function showDetails(b){const area=document.querySelector('#dialogContent');area.replaceChildren();const heading=document.createElement('h2');heading.id='dialogTitle';heading.textContent=b.title;area.append(heading);const fields=[['ผู้เขียน',b.author],['หมวดหมู่',b.category],['ปีเผยแพร่',b.year||'ไม่ระบุ'],['ISBN',b.isbn||'ไม่มี / ไม่ระบุ'],['ประเภทสิทธิ์',b.license||'ยังไม่ระบุ'],['รายละเอียด',b.description||'-']];for(const [label,value] of fields){const row=document.createElement('p');const strong=document.createElement('strong');strong.textContent=label+': ';row.append(strong,document.createTextNode(String(value)));area.append(row)}const url=safeURL(b.file);if(url){const a=document.createElement('a');a.className='cta';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='อ่าน / ดาวน์โหลดฟรี ↗';area.append(a)}else{const p=document.createElement('p');p.textContent='ยังไม่มีไฟล์สำหรับอ่านหรือดาวน์โหลด';area.append(p)}dialog.showModal()}

const SUBMIT_ENDPOINT='https://qhestuqalhhjcccbtano.supabase.co/functions/v1/submit-ebook';
const proposalForm=document.querySelector('#proposalForm');
const ebookFile=document.querySelector('#ebookFile');
const ebookStatus=document.querySelector('#ebookFileStatus');
const proposalNotice=document.querySelector('#proposalNotice');
const submitButton=document.querySelector('#submitEbook');

ebookFile.addEventListener('change',()=>{
  const file=ebookFile.files[0];
  if(!file){ebookStatus.textContent='ยังไม่ได้เลือกไฟล์';return;}
  if(!/\.(pdf|epub)$/i.test(file.name)||file.size===0||file.size>20*1024*1024){
    ebookFile.value='';
    ebookStatus.textContent='กรุณาเลือก PDF หรือ EPUB ขนาดไม่เกิน 20 MB';
    return;
  }
  ebookStatus.textContent='ไฟล์ที่เลือก: '+file.name+' ('+(file.size/1024/1024).toFixed(2)+' MB)';
});
proposalForm.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!proposalForm.reportValidity())return;
  const file=ebookFile.files[0];
  if(!file){proposalNotice.textContent='กรุณาเลือกไฟล์หนังสือก่อน';return;}
  if(!/\.(pdf|epub)$/i.test(file.name)||file.size===0||file.size>20*1024*1024){
    proposalNotice.textContent='ไฟล์ต้องเป็น PDF หรือ EPUB ขนาดไม่เกิน 20 MB';return;
  }
  const token=window.turnstile?.getResponse?.();
  if(!token){proposalNotice.textContent='กรุณาผ่านการตรวจสอบ Turnstile ก่อนส่ง';return;}
  const formData=new FormData(proposalForm);
  formData.delete('confirm');
  formData.set('file',file,file.name);
  formData.set('turnstileToken',token);
  submitButton.disabled=true;
  submitButton.textContent='กำลังอัปโหลด...';
  proposalNotice.textContent='กำลังส่งไฟล์ กรุณารอสักครู่';
  try{
    const response=await fetch(SUBMIT_ENDPOINT,{method:'POST',body:formData});
    let data={};
    try{data=await response.json();}catch{}
    if(!response.ok||!data.success)throw new Error(data.error||'ไม่สามารถส่งหนังสือได้');
    proposalNotice.textContent='ส่งหนังสือสำเร็จ! สถานะ: pending (รอผู้ดูแลตรวจสอบ)';
    proposalForm.reset();
    ebookFile.value='';
    ebookStatus.textContent='ยังไม่ได้เลือกไฟล์';
  }catch(err){
    proposalNotice.textContent='อัปโหลดไม่สำเร็จ: '+(err?.message||'โปรดลองอีกครั้ง');
  }finally{
    window.turnstile?.reset?.();
    submitButton.disabled=false;
    submitButton.textContent='Upload E-Book ↑';
  }
});
document.querySelector('#cancelProposal').addEventListener('click',()=>{
  ebookFile.value='';
  ebookStatus.textContent='ยกเลิกแล้ว ไม่มีการอัปโหลดไฟล์';
  proposalNotice.textContent='';
  window.turnstile?.reset?.();
});
