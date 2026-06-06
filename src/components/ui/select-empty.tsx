export default function SelectEmpty({ message = 'No records found' }: { message?: string }) {
  return (
    <div className="px-3 py-4 text-center text-sm text-gray-400 select-none">
      {message}
    </div>
  )
}
