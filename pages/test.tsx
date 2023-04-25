import {useState} from "react";
import {Message} from "../types/chat";

interface ChatCompletionChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role: string | null;
            content: string | null;
        };
        finishReason: null;
    }>;
}


const TestPage = () => {
    const [inputValue, setInputValue] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatContent, setChatContent] = useState('');

    let receivedData :string = '';
    async function fetchDataStream() {
        // await fetch("http://localhost/api/chat");

        // const source = new EventSource('http://localhost/api/chat');
        //
        // source.addEventListener('message', (event) => {
        //     const data = JSON.parse(event.data);
        //     console.log('Received message:', data.text);
        // });
        //
        // source.onerror = (error) => {
        //     console.error('Error connecting to the SSE server:', error);
        // };


        // const response = await fetch("http://localhost/api/chat");

        const response = await fetch("http://localhost/api/chat", {
            method: 'POST', // 指定请求方法为POST
            headers: {
                'Content-Type': 'application/json', // 设置请求头，告诉服务器我们发送的是JSON数据
            },
            body: JSON.stringify({ message: inputValue }) // 将请求体转换为JSON字符串
        });


        // @ts-ignore
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        const processStream = async (isFirst = true) => {
          // let receivedData = "";
          while (true) {
            const {done, value} = await reader.read();
            if (done) {
              // 数据流读取完成
              break;
            }

            // 将读取到的 Uint8Array 数据解码为字符串
            const chunk = decoder.decode(value, {stream: true});
            // console.log('fetchDataStream-processStream-22:', chunk);

              // 解析 SSE 格式的数据
              const lines = chunk.split('\n');
              for (const line of lines) {
                  if (line.startsWith('data: ')) {
                      // 提取 JSON 字符串并解析
                      const jsonString = line.substring(6);
                      const jsonData = JSON.parse(jsonString);
                      receivedData += jsonData.choices[0].delta.content;
                      // 在此处处理 jsonData，例如添加到聊天列表中
                      setChatContent(receivedData);
                      console.log(receivedData);
                  }
              }



            // 将数据块附加到 receivedData 字符串
            // receivedData += chunk;
            // const receivedData = JSON.parse(chunk);

            try {
              // 尝试将 receivedData 解析为 ChatCompletionChunk 对象
              // console.log('fetchDataStream-processStream-48:', receivedData);
              // const jsonData: ChatCompletionChunk = JSON.parse(receivedData);
              // console.log('fetchDataStream-processStream-49:', jsonData);
              //
              // // 提取聊天内容
              // const chatContent = jsonData.choices[0].delta.content;
              //
              // // 在此处处理收到的聊天内容，例如添加到聊天列表中
              // console.log('fetchDataStream-processStream-54:', chatContent);
              //
              // // 清空 receivedData 字符串，以便接收下一个 JSON 对象
              // receivedData = "";
            } catch (error) {
              // 如果 JSON.parse() 失败，表示 receivedData 中尚未包含完整的 JSON 对象
              // 继续读取下一个数据块
              console.log('fetchDataStream-processStream-61: Error', error);
            }


            // 在此处处理收到的数据块，例如添加到聊天列表中
            // setChatMessages((prevMessages) => [...prevMessages, chunk]);
          }
        };

        processStream().catch((error) => {
          console.error("Error processing the stream:", error);
        });
    }

    const sendMessage = () => {
        // console.log("发送聊天内容:", inputValue);
        fetchDataStream();
        setInputValue("");

        // 在发送消息后调用 fetchDataStream

    };

    return (
        <div>
            <h1>Test Page</h1>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <button onClick={sendMessage}>发送</button>
            <ul>
                {chatMessages.map((message, index) => (
                    <li key={index}>{message}</li>
                ))}
            </ul>
            <div style={{color: '#fff'}}>{chatContent}</div>
        </div>
    );
};

export default TestPage;
