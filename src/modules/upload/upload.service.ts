import axios from "axios";
import { prisma } from "../../lib/prisma";

// Core upload function (exported for public use)
export const uploadToImgbb = async (fileBuffer: Buffer, fileName?: string): Promise<string> => {
    if (!fileBuffer) {
        throw new Error("No file provided");
    }

    try {
        const base64Image = fileBuffer.toString('base64');
        
        const params = new URLSearchParams();
        params.append('image', base64Image);
        
        if (fileName) {
            const name = fileName.split('.')[0];
            params.append('name', `upload_${Date.now()}_${name}`);
        }

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 30000
            }
        );

        if (response.data.success) {
            return response.data.data.url;
        } else {
            throw new Error(response.data.error?.message || 'Upload failed');
        }
    } catch (error) {
        console.error("ImgBB upload error:", error);
        if (axios.isAxiosError(error) && error.response) {
            console.error("Response data:", error.response.data);
        }
        throw new Error(error instanceof Error ? error.message : "Upload service unavailable");
    }
};

// Upload avatar with user update (for logged-in users)
const uploadAvatar = async (userId: string, fileBuffer: Buffer, fileName?: string) => {
    try {
        const imageUrl = await uploadToImgbb(fileBuffer, fileName);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            }
        });

        return {
            success: true,
            message: "Avatar uploaded successfully",
            data: {
                url: updatedUser.image,
                user: updatedUser
            }
        };
    } catch (error) {
        console.error("Avatar upload error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to upload avatar"
        };
    }
};

export const uploadService = {
    uploadToImgbb,
    uploadAvatar
};