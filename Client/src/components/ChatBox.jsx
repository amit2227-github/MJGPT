import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'

const ChatBox = () => {

  const containerRef = useRef(null)

  const { selectedChat, setSelectedChat, theme, token, axios, user, setUser, chats, setChats } = useAppContext()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const[prompt,setPrompt] = useState('')
  const[mode,setMode] = useState('text')
  const[isPublished,setIsPublished] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    if (!selectedChat) {
      toast.error('No active chat session. Please create or select a chat first.')
      return
    }

    const requiredCredits = mode === 'image' ? 2 : 1
    if (!user || Number(user.credits) < requiredCredits) {
      toast.error(`Not enough credits. You need at least ${requiredCredits} credits.`)
      return
    }

    setLoading(true)

    const userMsg = {
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      isImage: false
    }

    const currentMessages = [...messages, userMsg]
    setMessages(currentMessages)
    setPrompt('')

    try {
      const endpoint = mode === 'image' ? '/api/message/image' : '/api/message/text'
      const payload = mode === 'image' 
        ? { chatId: selectedChat._id, prompt, isPublished }
        : { chatId: selectedChat._id, prompt }

      const { data } = await axios.post(endpoint, payload, {
        headers: { Authorization: token }
      })

      if (data.success) {
        const replyMsg = data.reply
        const updatedMessages = [...currentMessages, replyMsg]
        setMessages(updatedMessages)

        const updatedSelectedChat = { ...selectedChat, messages: updatedMessages }
        setSelectedChat(updatedSelectedChat)

        const updatedChats = chats.map(chat => {
          if (chat._id === selectedChat._id) {
            return updatedSelectedChat
          }
          return chat
        })
        setChats(updatedChats)

        setUser(prevUser => {
          if (prevUser) {
            return {
              ...prevUser,
              credits: Number(prevUser.credits) - requiredCredits
            }
          }
          return prevUser
        })

      } else {
        toast.error(data.message)
        setMessages(selectedChat.messages || [])
      }
    } catch (err) {
      toast.error(err.message)
      setMessages(selectedChat.messages || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedChat?.messages) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useEffect(() => { if(containerRef.current){
                containerRef.current.scrollTo({
                  top: containerRef.current.scrollHeight,
                  behavior:"smooth",
                })
  }},[messages])

  return (
    <div className="flex-1 flex flex-col m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* {Chat Messages} */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <div className="flex mr-9">
              <img
                src={assets.logo}
                alt=""
                className="w-full max-w-56 sm:max-w-68"
              />
              <div>
                <p className="ml-2 text-5xl">MJGPT</p>
                <p className="ml-2 text-xl">Intelligent AI Assistant</p>
              </div>
            </div>
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400">
              Ask me anything.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {/* {Three Dots Loading } */}

          {
            loading && <div className='loader flex items-center gap-1.5'> 
              <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>
                  <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'></div>

            </div>
          }
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mg-3 text-sm mx-auto'>
          <p className='text-xs mb-2'>Publish Generated Image to Community</p>
          <input type="checkbox" className='cursor-pointer mb-2' checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}/>
        </label>
      )}

      {/* {Prompt Input Box} */}

          <form  onSubmit={onSubmit}
             className="bg-primary/20 dark:bg-[#583C79]/30
             border border-primary dark:border-[#80609F]/30
             rounded-full w-full max-w-2xl
             p-3 pl-4 mx-auto flex gap-4 items-center" >
            <select onChange={(e) => setMode(e.target.value)} className='text-sm pl-3 pr-2 outline-none'>
              <option className='dark:bg-purple-900' value="text">Text</option>
              <option className='dark:bg-purple-900' value="image">Image</option>
            </select>
            <input onChange={(e) =>setPrompt(e.target.value)} value={prompt}  type="text" placeholder='Type your prompt here..' className='flex-1
            w-full text-sm outline-none' required/>
            <button disabled={loading}>
              <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8 cursor-pointer' alt="" />
            </button>
          </form>
    </div>
  )
}

export default ChatBox
