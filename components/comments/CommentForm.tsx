'use client';

import React from 'react';
import { Formik, Form, Field } from 'formik';
import { toast } from 'react-hot-toast';
import { useCreateCommentMutation } from '../../lib/store/api/commentsApi';
import { Button } from '../ui';
import * as Yup from 'yup';

interface CommentFormProps {
  postId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormValues {
  content: string;
}

const validationSchema = Yup.object({
  content: Yup.string()
    .required('Comment is required')
    .max(500, 'Comment must be 500 characters or less'),
});

const CommentForm: React.FC<CommentFormProps> = ({ postId, onSuccess, onCancel }) => {
  const [createComment, { isLoading }] = useCreateCommentMutation();

  const initialValues: FormValues = {
    content: '',
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await createComment({
        content: values.content,
        postId,
      }).unwrap();
      
      // toast.success('Comment added successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to add comment');
      console.error('Create comment error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-4">
            <div>
              <Field
                as="textarea"
                name="content"
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  {values.content.length}/500 characters
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={!values.content.trim() || isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CommentForm;
