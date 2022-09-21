import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import EditTicketForm from './EditTicketForm';
import TicketDetail from './TicketDetail';
import React, { useEffect, useState } from 'react';
import { db, auth } from './../firebase.js';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';

function TicketControl() {

  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [mainTicketList, setMainTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket]= useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

    useEffect(() => {
      function updateTicketElapsedWaitTime() {
        const newMainTicketList = mainTicketList.map(ticket => {
          const newFormattedWaitTime = formatDistanceToNow(ticket.timeOpen);
          return { ...ticket, formattedWaitTime: newFormattedWaitTime};
        });
        setMainTicketList(newMainTicketList);
      }
      const waitTimeUpdateTimer = setInterval(() =>
      updateTicketElapsedWaitTime(),
      60000
      );
      return function cleanup() {
        clearInterval(waitTimeUpdateTimer);
      }
    }, [mainTicketList])

    useEffect(() => {
      const queryByTimestamp = query(
        collection(db, "tickets"),
        orderBy('timeOpen')
      );
      const unSubscribe = onSnapshot(
       queryByTimestamp,
       (querySnapshot) => {
        const tickets = [];
        querySnapshot.forEach((doc) => {
          const timeOpen = doc.get('timeOpen', {serverTimestamps: "estimate"}).toDate();
          const jsDate = new Date(timeOpen);
          tickets.push({
            names: doc.data().names, 
            location: doc.data().location,
            issue: doc.data().issue,
            timeOpen: jsDate,
            formattedWaitTime: formatDistanceToNow(jsDate, {
              addSuffix: true,
            }),
            id: doc.id
          });
        });
        setMainTicketList(tickets);
      },
      (error)=> {
        setError(error.message);
      }
      );
      return () => unSubscribe();
    }, []);
  

  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      setSelectedTicket(null);
      setEditing(false);
    } else {
      setFormVisibleOnPage(!formVisibleOnPage);
      }
    }
  

  const handleDeletingTicket = async (id) => {
    await deleteDoc(doc(db,"tickets", id));
    setSelectedTicket(null);
   
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleEditingTicketInList = async (ticketToEdit) => {
    const ticketRef = doc(db, "ticket", ticketToEdit.id);
    await updateDoc(ticketRef, ticketToEdit);
      setEditing(false);
      setSelectedTicket(null);
  }

  // The collection() function allows us to specify a collection within our firestore database. This function takes two arguments: the Firestore database instance, and the name of our collection. This function returns a CollectionReference object

  // The addDoc() function allows us to add a new document to a specified collection. This function takes two arguments: a collection reference and the data to be added to the new document.

  // handleAddingNewTicketToList easier way to read
  // const handleAddingNewTicketToList = async (newTicketData) => {
  //   const collectionRef = collection(db, "tickets");
  //   await addDoc(collectionRef, newTicketData);
  //   setFormVisibleOnPage(false);
  // }

  const handleAddingNewTicketToList = async (newTicketData) => {
    await addDoc(collection(db, "ticket"), newTicketData);
    setFormVisibleOnPage(false);
  }

  const handleChangingSelectedTicket = (id) => {
    const selection = mainTicketList.filter(ticket => ticket.id === id)[0];
    setSelectedTicket(selection);
  }
  
  if (auth.currentUser == null){
    return (
        <React.Fragment> 
            <h1>You must be signed in to access the queue</h1>
        </React.Fragment>
    )
} else if (auth.currentUser != null) {
    let currentlyVisibleState = null;
    let buttonText = null; 
    if (error) {
      currentlyVisibleState = <p>There was an error: {error}</p>
    } else if ( editing ) {      
      currentlyVisibleState = <EditTicketForm ticket = {selectedTicket} onEditTicket = {handleEditingTicketInList} />
      buttonText = "Return to Ticket List";
    } else if (selectedTicket != null) {
      currentlyVisibleState = <TicketDetail 
      ticket={selectedTicket} 
      onClickingDelete={handleDeletingTicket}
      onClickingEdit = {handleEditClick} />
      buttonText = "Return to Ticket List";
    } else if (formVisibleOnPage) {
      currentlyVisibleState = <NewTicketForm onNewTicketCreation={handleAddingNewTicketToList}/>;
      buttonText = "Return to Ticket List"; 
    } else {
      currentlyVisibleState = <TicketList onTicketSelection={handleChangingSelectedTicket} ticketList={mainTicketList} />;
      buttonText = "Add Ticket"; 
    }
 
    return (
      <React.Fragment>
        {currentlyVisibleState}
        {error ? null : <button onClick=
        {handleClick}>{buttonText}</button>} 
      </React.Fragment>
    );
  }
}



export default TicketControl;

