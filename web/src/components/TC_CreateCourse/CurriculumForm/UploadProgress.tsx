import Progress from './addVideo/UploadProgress'
const UploadProgress = ({
  progressLst
}: {
  progressLst: {
    title: string
    progress: number
  }[]
}) => {
  return (
    <>
      {progressLst?.map((item) => (
        <Progress key={item.title} progress={item.progress} title={item.title} />
      ))}
    </>
  )
}

export default UploadProgress
