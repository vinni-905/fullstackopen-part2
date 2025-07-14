const Note = ({ note }) => {
  return (
    <li>
      {note.content} {note.important ? <strong>important</strong> : ''}
    </li>
  )
}

export default Note;
