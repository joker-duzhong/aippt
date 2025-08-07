from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import httpx  # 添加httpx导入
from fastapi.middleware.cors import CORSMiddleware

# 定义数据模型
class PPTRequest(BaseModel):
    title: str
    content: List[str]  # 添加content字段
    template: Optional[str] = "default"
    style: Optional[str] = "business"

class PPTResponse(BaseModel):
    ppt_id: str
    title: str
    pages: int
    download_url: str
    status: str

# 新增的数据模型
class MessageItem(BaseModel):
    role: str
    content: str

class ContentRequest(BaseModel):
    content: str = ""
    mode: str = "glm-4.5"
    prompt: str = ""
    key: str = "horltqg8iupk0n1ypfn75soyn4rbaiod"

class ContentResponse(BaseModel):
    title: str
    outline: List[str]
    content: List[str]

# 创建FastAPI应用实例
app = FastAPI(title="AI PPT API", description="AI自动制作PPT的接口服务")

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 模拟数据存储
ppt_storage = {}

# 现有的路由保持不变...

# 新增内容生成接口
@app.post("/api/v1/ppt/generate-content", response_model=ContentResponse, summary="生成PPT内容")
async def generate_ppt_content(request: ContentRequest):
    """
    调用AI接口生成PPT的标题、大纲和内容
    """
    try:
        # 准备请求数据
        payload = {
            "message": [
                {"role": "system", "content": request.prompt},
                {"role": "user", "content": request.content}
            ],
            "mode": request.mode,
            "key": request.key
        }
        
        # 打印请求参数用于调试
        print(f"请求URL: https://aliyun.zaiwen.top/admin/chatbot")
        print(f"请求参数: {payload}")
        
        # 调用外部API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://aliyun.zaiwen.top/admin/chatbot",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            # 打印响应详情用于调试
            print(f"响应状态码: {response.status_code}")
            print(f"响应头: {response.headers}")
            print(f"响应内容: {response.text}")
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"外部API调用失败 - 状态码: {response.status_code}, 响应: {response.text}"
                )
            
            # 解析响应
            try:
                # 首先尝试直接解析JSON
                api_response = response.json()
                print(f"解析后的JSON响应: {api_response}")
            except Exception as json_error:
                # 如果不是JSON格式，尝试解析markdown格式
                print(f"JSON解析失败: {str(json_error)}，尝试解析markdown格式")
                markdown_content = response.text
                parsed_content = parse_markdown_response(markdown_content)
                return ContentResponse(**parsed_content)
            
            # 检查API响应中是否有错误信息
            if "error" in api_response:
                raise HTTPException(
                    status_code=500, 
                    detail=f"API返回错误: {api_response['error']}"
                )
            
            # 检查必需的字段是否存在
            required_fields = ["title", "outline", "content"]
            for field in required_fields:
                if field not in api_response:
                    print(f"警告: 响应中缺少字段 '{field}'")
            
            # 返回生成的内容
            return ContentResponse(
                title=api_response.get("title", "默认标题"),
                outline=api_response.get("outline", []),
                content=api_response.get("content", [])
            )
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=500, 
            detail="外部API调用超时"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"请求外部API时发生网络错误: {str(e)}"
        )
    except HTTPException:
        # 重新抛出已经处理过的HTTP异常
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"内容生成失败: {str(e)}"
        )

def parse_markdown_response(markdown_text: str) -> dict:
    """
    解析markdown格式的响应内容
    """
    lines = markdown_text.strip().split('\n')
    
    # 提取标题
    title = "默认标题"
    for line in lines:
        if line.startswith("### PPT大纲："):
            title = line.replace("### PPT大纲：", "").strip()
            break
    
    # 提取幻灯片内容
    slides = []
    current_slide = None
    content_list = []
    
    for line in lines:
        line = line.strip()
        if line.startswith("#### 幻灯片"):
            # 保存上一张幻灯片
            if current_slide:
                slides.append(current_slide)
            
            # 提取幻灯片标题
            # 处理 "#### 幻灯片 1: 封面" 这样的格式
            if ": " in line:
                try:
                    slide_title = line.split(": ", 1)[1].strip()
                    current_slide = {
                        "title": slide_title,
                        "content": []
                    }
                except:
                    # 如果解析失败，使用默认标题
                    current_slide = {
                        "title": "未命名幻灯片",
                        "content": []
                    }
            else:
                current_slide = {
                    "title": "未命名幻灯片",
                    "content": []
                }
                
        elif line.startswith("- 内容要点：") and current_slide is not None:
            # 跳过内容要点这一行本身
            continue
            
        elif line.startswith("  - ") and current_slide is not None:
            # 处理内容要点项
            content = line[4:].strip()  # 去掉 "  - " 前缀
            # 过滤掉特定的行（如说明文字等）
            if not content.startswith("说明文字："):
                current_slide["content"].append(content)
                
        elif line.startswith("- ") and current_slide is not None:
            content = line[2:].strip()  # 去掉 "- " 前缀
            # 过滤掉封面页的特定内容
            if not content.startswith("标题：") and not content.startswith("副标题：") and not content.startswith("图片：") and not content.startswith("内容要点：") and not content.startswith("说明文字："):
                current_slide["content"].append(content)
    
    # 添加最后一个幻灯片
    if current_slide:
        slides.append(current_slide)
    
    # 构造content列表
    for slide in slides:
        slide_content = f"{slide['title']}\n" + "\n".join([f"  {c}" for c in slide["content"]])
        content_list.append(slide_content)
    
    # 构造outline列表（只包含幻灯片标题）
    outline = [slide['title'] for slide in slides]
    
    print(f"解析后的标题: {title}")
    print(f"解析后的大纲: {outline}")
    print(f"解析后的内容: {content_list}")
    
    return {
        "title": title,
        "outline": outline,
        "content": content_list
    }
# 创建PPT接口
@app.post("/api/v1/ppt/create", response_model=PPTResponse, summary="创建PPT")
async def create_ppt(request: PPTRequest):
    """
    创建一个新的PPT演示文稿
    
    - **title**: PPT标题
    - **content**: PPT内容列表，每个元素代表一页的内容
    - **template**: 模板样式 (可选)
    - **style**: 风格类型 (可选)
    """
    try:
        # 生成唯一的PPT ID
        import uuid
        ppt_id = str(uuid.uuid4())[:8]
        
        # 模拟PPT生成过程
        # 实际应用中这里会调用AI生成PPT的逻辑
        
        # 存储PPT信息
        ppt_storage[ppt_id] = {
            "title": request.title,
            "content": request.content,
            "template": request.template,
            "style": request.style,
            "pages": len(request.content),
            "status": "completed"
        }
        
        # 返回响应
        return PPTResponse(
            ppt_id=ppt_id,
            title=request.title,
            pages=len(request.content),
            download_url=f"http://localhost:8000/api/v1/ppt/download/{ppt_id}",
            status="completed"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PPT创建失败: {str(e)}")

# 获取PPT状态接口
@app.get("/api/v1/ppt/{ppt_id}", response_model=PPTResponse, summary="获取PPT信息")
async def get_ppt(ppt_id: str):
    """
    根据PPT ID获取PPT信息和状态
    """
    if ppt_id not in ppt_storage:
        raise HTTPException(status_code=404, detail="PPT不存在")
    
    ppt_info = ppt_storage[ppt_id]
    return PPTResponse(
        ppt_id=ppt_id,
        title=ppt_info["title"],
        pages=ppt_info["pages"],
        download_url=f"http://localhost:8000/api/v1/ppt/download/{ppt_id}",
        status=ppt_info["status"]
    )

# 获取所有PPT接口
@app.get("/api/v1/ppt", response_model=List[PPTResponse], summary="获取所有PPT")
async def list_ppts():
    """
    获取所有已创建的PPT列表
    """
    ppt_list = []
    for ppt_id, info in ppt_storage.items():
        ppt_list.append(PPTResponse(
            ppt_id=ppt_id,
            title=info["title"],
            pages=info["pages"],
            download_url=f"http://localhost:8000/api/v1/ppt/download/{ppt_id}",
            status=info["status"]
        ))
    return ppt_list

# 健康检查接口
@app.get("/health", summary="健康检查")
async def health_check():
    """
    检查API服务是否正常运行
    """
    return {"status": "healthy", "service": "AI PPT API"}

# 主程序入口
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)