// Local preview only. GitHub Pages serves the website without Node.js.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
 try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));if(!file.startsWith(root+path.sep))throw Error('Invalid path');const bytes=fs.readFileSync(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes)}catch{res.writeHead(404);res.end('Not found')}
});
server.on('error',e=>{console.error(e.message);process.exitCode=1});
server.listen(0,'127.0.0.1',()=>{
 const url='http://127.0.0.1:'+server.address().port+'/';console.log('Local preview: '+url+'\nClose this window to stop.');
 if(process.platform==='win32'&&!process.argv.includes('--no-open'))require('child_process').spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'});
});
