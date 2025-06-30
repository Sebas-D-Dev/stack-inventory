export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Form from "next/form";

export default function NewUser() {
  async function createUser(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    await prisma.user.create({
      data: { name, email, password: "" }, // password will be added by NextAuth
    });

    redirect("/");
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
      <h1 className="text-3xl font-bold mb-6 themed-span-primary">Create New User</h1>
      <Form action={createUser} className="space-y-6">
        <div>
          <label htmlFor="name" className="themed-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter user name ..."
            className="themed-input"
          />
        </div>
        <div>
          <label htmlFor="email" className="themed-label required-field">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Enter user email ..."
            className="themed-input"
          />
        </div>
        <button type="submit" className="form-button w-full py-3">
          Create User
        </button>
      </Form>
    </div>
  );
}
