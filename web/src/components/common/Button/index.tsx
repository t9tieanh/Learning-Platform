const CustomButton = ({ label, className }: { label: string; className?: string }) => {
  return (
    <>
      <button className={`btn ${className}`}>{label}</button>
    </>
  )
}

export default CustomButton
