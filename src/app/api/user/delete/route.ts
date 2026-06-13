import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Get user ID from token
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Delete user data
    const deleteUrl = `${supabaseUrl}/rest/v1`;
    const headers = {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    };

    // Delete related data
    await fetch(`${deleteUrl}/user_profiles?id=eq.${userId}`, {
      method: "DELETE",
      headers,
    });

    await fetch(`${deleteUrl}/addresses?user_id=eq.${userId}`, {
      method: "DELETE",
      headers,
    });

    await fetch(`${deleteUrl}/wishlists?user_id=eq.${userId}`, {
      method: "DELETE",
      headers,
    });

    await fetch(`${deleteUrl}/reviews?user_id=eq.${userId}`, {
      method: "DELETE",
      headers,
    });

    // Delete auth user
    const deleteAuthResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
      }
    );

    if (!deleteAuthResponse.ok) {
      throw new Error("Failed to delete user account");
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete account";
    console.error("Delete account error:", error);
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
