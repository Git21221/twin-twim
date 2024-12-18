import SearchIcon from '../SearchIcon'

function Searchbar() {
  return (
    <div className='sticky border border-b-[3px] border-[--main-background-color] px-4 py-3 m-5 rounded-lg flex gap-3 items-center'>
      <SearchIcon />
      <p>
        Search for a new chat
      </p>
    </div>
  )
}

export default Searchbar