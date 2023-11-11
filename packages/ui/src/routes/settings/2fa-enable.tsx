import {motion} from 'framer-motion'
import {ReactNode, useEffect, useState} from 'react'
import QRCode from 'react-qr-code'
import {useNavigate} from 'react-router-dom'
import {toast} from 'sonner'

import {DialogMounter} from '@/components/dialog-mounter'
import {CopyableField} from '@/components/ui/copyable-field'
import {PinInput} from '@/components/ui/pin-input'
import {useUmbrelTitle} from '@/hooks/use-umbrel-title'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogPortal,
	DialogTitle,
} from '@/shadcn-components/ui/dialog'
import {Separator} from '@/shadcn-components/ui/separator'
import {trpcReact} from '@/trpc/trpc'
import {useAfterDelayedClose} from '@/utils/dialog'

export function TwoFactorEnableDialog() {
	const title = 'Enable two-factor authentication'
	useUmbrelTitle(title)
	const [open, setOpen] = useState(true)
	const navigate = useNavigate()

	useAfterDelayedClose(open, () => navigate('/settings', {preventScrollReset: true}))

	const ctx = trpcReact.useContext()

	const [totpUri, setCode] = useState('')
	useEffect(() => {
		ctx.user.generateTotpUri.fetch().then((res) => setCode(res))
	}, [ctx])

	const enable2faMut = trpcReact.user.enable2fa.useMutation()

	const checkCode = async (totpToken: string) => {
		return enable2faMut.mutateAsync(
			{totpToken, totpUri},
			{
				onSuccess: () => {
					setTimeout(() => {
						ctx.user.is2faEnabled.invalidate()
						toast.success('Two-factor authentication enabled')
						setOpen(false)
					}, 500)
				},
			},
		)
	}

	if (!totpUri) return null

	return (
		<DialogMounter>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogPortal>
					<DialogContent className='flex flex-col items-center gap-5'>
						<DialogHeader>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription>
								Scan this QR code using an authenticator app like Google Authenticator or Authy
							</DialogDescription>
						</DialogHeader>
						<AnimateInQr>
							<QRCode
								size={256}
								style={{height: 'auto', maxWidth: '100%', width: '100%'}}
								value={totpUri}
								viewBox={`0 0 256 256`}
							/>
						</AnimateInQr>
						<div className='w-full space-y-2 text-center'>
							<p className='text-15 font-normal -tracking-2 opacity-60'>Or paste the following code in the app</p>
							<CopyableField value={totpUri} />
						</div>
						<Separator />
						<p className='text-17 font-normal leading-none -tracking-2'>
							Enter the code displayed in your authenticator app
						</p>

						<PinInput autoFocus length={6} onCodeCheck={checkCode} />
					</DialogContent>
				</DialogPortal>
			</Dialog>
		</DialogMounter>
	)
}

const AnimateInQr = ({children}: {children: ReactNode}) => (
	<div
		className='relative mx-auto w-[240px]'
		style={{
			perspective: '300px',
		}}
	>
		<motion.div
			className='rounded-8 bg-white p-3'
			initial={{
				opacity: 0,
				rotateX: 20,
				rotateY: 10,
				rotateZ: 0,
				scale: 0.5,
			}}
			animate={{
				opacity: 1,
				rotateX: 0,
				rotateY: 0,
				rotateZ: 0,
				scale: 1,
			}}
			transition={{duration: 0.15, ease: 'easeOut'}}
		>
			{children}
		</motion.div>
	</div>
)