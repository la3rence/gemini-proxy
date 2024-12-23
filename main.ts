
import { createServer } from "node:https";
import { request as httpRequest } from "node:https";

const TARGET_HOST = 'generativelanguage.googleapis.com';
const TARGET_URL = `https://${TARGET_HOST}`;

const proxyServer = createServer((req, res) => {
  // 创建一个转发请求
  // req.headers['origin'] = TARGET_URL
  const forwardRequest = httpRequest(
    TARGET_URL + req.url, // 目标服务器的完整 URL
    {
      method: req.method,  // 传递原始请求的方法
      headers: {
        //  ...req.headers,
         'Content-Type': 'application/json',
         'host': TARGET_HOST
      },
    },
    (targetRes) => {
      targetRes.headers['Access-Control-Allow-Origin'] = '*'
      targetRes.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS'
      targetRes.headers['Access-Control-Max-Age'] = '86400'
      targetRes.headers['Access-Control-Allow-Credentials'] = true
      targetRes.headers['Access-Control-Allow-Headers'] = 'Authorization,Content-Type,User-Agent,Accept,X-Requested-With,X-Stainless-Lang,X-Stainless-Package-Version,X-Stainless-Os,X-Stainless-Arch,X-Stainless-Retry-Count,X-Stainless-Runtime,X-Stainless-Runtime-Version,X-Stainless-Async'
    
      if(req.method == 'OPTIONS'){
        res.writeHead(200, 'OK', targetRes.headers);
        targetRes.pipe(res);
      } else {
        res.writeHead(targetRes.statusCode!, targetRes.statusMessage, targetRes.headers);
        targetRes.pipe(res);
      }
    }
  );

  // 将客户端请求的数据流转发到目标服务器
  req.pipe(forwardRequest);

  // 如果目标请求出错，则返回错误
  forwardRequest.on("error", (err) => {
    res.statusCode = 500;
    res.end(`Request to target server failed: ${err.message}`);
  });
});

const port = 3000; // 代理服务器监听端口
proxyServer.listen(port, () => {
  console.log(`Proxy server running on ${port}`);
});

// return;
