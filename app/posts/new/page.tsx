"use client";

import Form from "next/form";
import { createPost } from "./actions";

export default function NewPost() {
  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
      <h1 className="text-2xl font-bold mb-6 themed-span-primary">Create New Post</h1>
      <Form action={createPost} className="space-y-6">
        <div>
          <label htmlFor="title" className="themed-label required-field">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="Enter your post title ..."
            className="themed-input"
          />
        </div>
        <div>
          <label htmlFor="content" className="themed-label">Content</label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your post content here ..."
            rows={6}
            className="themed-input"
          />
        </div>
        <button type="submit" className="form-button w-full py-3">
          Create Post
        </button>
      </Form>
    </div>
  );
}
