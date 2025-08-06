from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# 创建FastAPI应用实例
app = FastAPI(title="AI PPT API", description="AI自动制作PPT的接口服务")

# 定义数据模型
class PPTRequest(BaseModel):
    title: str
    content: List[str]
    template: Optional[str] = "default"
    style: Optional[str] = "business"

class PPTResponse(BaseModel):
    ppt_id: str
    title: str
    pages: int
    download_url: str
    status: str

# 模拟数据存储
ppt_storage = {}

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