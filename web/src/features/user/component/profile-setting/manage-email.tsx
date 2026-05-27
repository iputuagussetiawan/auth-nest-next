import type { IUserProfile } from '../../types/user-type'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ManageEmailProps {
    user: IUserProfile
    onSuccess: () => void
}

export default function ManageEmail({ user, onSuccess }: ManageEmailProps) {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Manage Email</DialogTitle>
                <DialogDescription>
                    Your current email address is shown below. Email changes are not self-service — contact support to update it.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label>Current Email</Label>
                <Input value={user.email} readOnly className="bg-muted mt-1 cursor-not-allowed" />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onSuccess}>Close</Button>
            </DialogFooter>
        </>
    )
}
