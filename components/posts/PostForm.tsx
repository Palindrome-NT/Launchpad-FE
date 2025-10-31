'use client';

import React, { useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useCreatePostMutation, useUploadMediaMutation } from '../../lib/store/api/postsApi';
import { Button, Input, Card, CardHeader, CardContent } from '../ui';
import { X, ImageIcon, Video, Upload, Trash2 } from 'lucide-react';
import * as Yup from 'yup';

interface PostFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  content: string;
  media: string[];
  mediaType: ('image' | 'video')[];
}

const validationSchema = Yup.object({
  content: Yup.string()
    .required('Content is required')
    .max(300, 'Content must be 300 characters or less'),
});

const PostForm: React.FC<PostFormProps> = ({ onClose, onSuccess }) => {
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  console.log("🚀 ~ PostForm ~ mediaUrls:", mediaUrls)
  const [mediaTypes, setMediaTypes] = useState<('image' | 'video')[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialValues: FormValues = {
    content: '',
    media: [],
    mediaType: [],
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types and limits
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (imageFiles.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    
    if (videoFiles.length > 1) {
      toast.error('Maximum 1 video allowed');
      return;
    }
    
    if (mediaTypes.includes('video') && videoFiles.length > 0) {
      toast.error('Only one video allowed per post');
      return;
    }

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('media', file);
      });
      
      const result = await uploadMedia(formData).unwrap();
      
      // Add the new URLs and types to existing ones
      setMediaUrls(prev => [...prev, ...result.urls]);
      setMediaTypes(prev => [...prev, ...result.types]);
      setMediaFiles(prev => [...prev, ...files]);
      
      toast.success('Media uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload media');
      console.error('Upload error:', error);
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
    setMediaTypes(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await createPost({
        content: values.content,
        media: mediaUrls,
        mediaType: mediaTypes,
      }).unwrap();
      
      // toast.success('Post created successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to create post');
      console.error('Create post error:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              {/* Content Input */}
              <div>
                <Field
                  as="textarea"
                  name="content"
                  placeholder="What's on your mind?"
                  className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  rows={4}
                  maxLength={300}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {values.content.length}/300 characters
                  </p>
                </div>
              </div>

              {/* Media Preview */}
              {mediaUrls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Media Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        {mediaTypes[index] === 'image' ? (
                          <Image
                            src={url}
                            alt={`Media ${index + 1}`}
                            width={200}
                            height={96}
                            className="w-full h-24 object-cover rounded-lg"
                            unoptimized
                          />
                        ) : (
                          <video
                            src={url}
                            className="w-full h-24 object-cover rounded-lg"
                            controls
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Upload */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  {isUploading ? 'Uploading...' : 'Add Media'}
                </Button>
                <span className="text-sm text-gray-500">
                  Max 3 images, 1 video
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isCreating}
                  disabled={!values.content.trim() || isCreating}
                  className="px-6"
                >
                  {isCreating ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PostForm;
