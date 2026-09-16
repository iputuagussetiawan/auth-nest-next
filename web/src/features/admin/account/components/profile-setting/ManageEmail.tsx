import { UiButton } from '@/components/ui-custom/UiButton'
import { UiFormInput } from '@/components/ui-custom/UiFormInput'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import type { IUserProfile } from '../../types/AccountTypes'

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
                    Your current email address is shown below. Email changes are not self-service —
                    contact support to update it.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <UiFormInput
                    label="Current Email"
                    value={user.email}
                    readOnly
                    className="cursor-not-allowed"
                />
            </div>
            <DialogFooter>
                <UiButton variant="outline" onClick={onSuccess}>
                    Close
                </UiButton>
            </DialogFooter>
        </>
    )
}
