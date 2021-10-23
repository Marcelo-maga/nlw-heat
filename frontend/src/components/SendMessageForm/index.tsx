import { FormEvent, useContext, useState } from 'react'
import { VscGithubInverted, VscSignOut } from 'react-icons/vsc'
import { AuthContext } from '../../context/AuthContext'
import { api } from '../../services/api'
import styles from './styles.module.scss'

export function SendMessageForm() {
  const { user, signOut } = useContext(AuthContext)
  const [message, setMessage] = useState('')

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault()

    if(!message.trim()) return
    
    await api.post('/messages', {
      message
    })

    setMessage('')

  }

  return(
    <div className={styles.sendMessageFormWrapper}>

      <button  onClick={signOut} className={styles.singOutButtom}>
        <VscSignOut size={32}/>
      </button>

      <header className={styles.userInfo} >
        <div className={styles.userImage} >
          <img src={user?.avatar_url} alt={user?.name} />
        </div>
        <strong className={styles.userName}>{user?.name}</strong>
        <span className={styles.userGithub}>
          <VscGithubInverted />
          {user?.login}
        </span>
      </header>

      <form  onSubmit={handleSendMessage} className={styles.sendMessageForm}>
        <label htmlFor="message">Messagem</label>
        <textarea onChange={event => setMessage(event.target.value)} 
        name="message" id="message" placeholder='Qual é a sua mensagem?'/>

        <button type='submit'>Enviar</button>
      </form>

    </div>
  )
}
