import { format } from "date-fns";
import { redirect } from "next/navigation";
import { approveUserAction, updateUserAccessAction } from "@/app/admin/users/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { listUsers } from "@/lib/server/user-service";

export default async function AdminUsersPage() {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/signin");
  }

  if (!isAdmin(session.user.role)) {
    redirect("/");
  }

  const users = await listUsers();
  const pendingUsers = users.filter((user) => user.accessState === "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Access</h1>
          <p className="text-sm text-muted-foreground">Approve new registrations, change roles, and manage account access.</p>
        </div>
        <Badge variant="secondary">{users.length} users</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
          <CardDescription>New users are created as viewers and remain blocked until an admin activates them.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending user approvals.</p>
          ) : (
            pendingUsers.map((user) => (
              <form key={user.id} action={approveUserAction} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
                <input type="hidden" name="userId" value={user.id} />
                <div>
                  <div className="font-medium">{user.name ?? "Unnamed user"}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">Requested {format(user.createdAt, "MMM d, yyyy")}</div>
                </div>
                <Button type="submit">Approve as viewer</Button>
              </form>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardDescription>Update roles and toggle whether an account can access the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const formId = `user-access-${user.id}`;

                return (
                <TableRow key={user.id}>
                  <TableCell>{user.name ?? "-"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      name="role"
                      form={formId}
                      defaultValue={user.role}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="admin">admin</option>
                      <option value="editor">editor</option>
                      <option value="viewer">viewer</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      name="accessState"
                      form={formId}
                      defaultValue={user.accessState}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="active">active</option>
                      <option value="pending">pending</option>
                    </select>
                  </TableCell>
                  <TableCell>{format(user.createdAt, "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <form id={formId} action={updateUserAccessAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Save
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
