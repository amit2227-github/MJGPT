import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'

const ChatBox = () => {
  const { selectedChat, theme  } = useAppContext()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const[prompt,setPrompt] = useState('')
  const[mode,setMode] = useState('text')
  const[isPublished,setIsPublished] = useState(false)

  const onSubmit =  async (e) => {
      e.preventDefault()
  }

  useEffect(() => {
    if (selectedChat?.messages) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  return (
    <div className="flex-1 flex flex-col m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      <div className="flex-1 mb-5 overflow-y-scroll">
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
