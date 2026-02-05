import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import {assets} from '../assets/assets' 
import moment from 'moment'

const Sidebar = () => {

  const {
    chats = [],
    setSelectedChat,
    theme = 'dark',
    setTheme,
    user,
    navigate
  } = useAppContext()

  const [search, setSearch] = useState('')

  return (
    <div className='flex flex-col h-screen min-w-72 p-5 
      dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 
      border-r border-[#80609F]/30 backdrop-blur-3xl 
      transition-all duration-500 
      max-md:absolute left-0 z-[1]'
    >
  

      <div className='flex '>
          <img
          src={theme === 'dark' ? assets.logo : assets.logo} 
          alt="Logo"
          className='w-mid max-w-48'
        />
        <div>
          <p className='ml-4 text-2xl'>MJGPT</p>
          <p className='ml-4'>Intelligent AI Assistant</p>
        </div>
      </div>
      
      <button className='flex justify-center items-center w-full py-2 mt-5 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer'>
        <span className='mr-2 text-xl'>+</span>
        New Chat
      </button>

      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
      <img
        src={assets.search_icon}
        className="w-4 not-dark:invert"
        alt=""
      />
      <input
        type="text"
        placeholder="Search conversations"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-xs placeholder:text-gray-400 outline-none bg-transparent w-full"
      />
    </div>

    {/* Recent chats */}
    {/* Recent chats */}
    {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

    <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
      {chats
        .filter((chat) => {
          const firstMessage = chat.messages[0]

          if (firstMessage && typeof firstMessage.content === 'string') {
            return firstMessage.content
              .toLowerCase()
              .includes(search.toLowerCase())
          }

          return chat.name.toLowerCase().includes(search.toLowerCase())
        })
        .map((chat) => (
          <div
            key={chat._id}
            className="p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group"
          >
            <div>
              <p className="truncate w-full">
                {chat.messages.length > 0 && typeof chat.messages[0].content === 'string'
                  ? chat.messages[0].content.slice(0, 32)
                  : chat.name}
              </p>

              <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                {moment(chat.updatedAt).fromNow()}
              </p>
            </div>

            <img
              src={assets.bin_icon}
              className="hidden group-hover:block w-4 cursor-pointer not-dark:invert"
              alt=""
            />
          </div>
        ))}
    </div>

        {/* {Community image} */}
        <div onClick={() => {navigate('/Community')}} className="flex items-center gap-2 p-3 mt-4 border border-gray-300
         dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all">
          <img src={assets.gallery_icon} className='w-4.5 not-dark:invert' alt="" />
          <div className='flex flex-col text-sm'>
                <p>Community Images</p>
          </div>
        </div>

        {/* {Credit Purchases Option} */}
        <div onClick={() => {navigate('/credits')}} className="flex items-center gap-2 p-3 mt-4 border border-gray-300
         dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all">
          <img src={assets.diamond_icon} className='w-4.5 not-dark:invert' alt="" />
          <div className='flex flex-col text-sm'>
                <p>Credits : {user?.credits}</p>
                <p>Purchase credits to use MJGPT</p>
          </div>
        </div>

    </div>
  )
}

export default Sidebar
