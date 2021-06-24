import React from 'react';
import dots from '../../assets/dots.svg';

const ActionItem = ({ action, status, onGrabItem = () => {} }) => {
  const dragStart = async (e, action) => {
    // const { status, id } = this.props;
    addGhostDragger(e, action.goal);
    e.dataTransfer.setData(
      'cardData',
      JSON.stringify({
        cardId: `issue-${action.issueId}-${action.id}`,
        id: action.id,
        title: action.goal,
        isNew: true,
        status,
      }),
    );
    setTimeout(onGrabItem, 100);
  };

  const removeGhostElement = () => {
    const ghost = document.getElementById('drag-ghost');
    if (ghost) {
      ghost.remove();
    }
  };

  const addGhostDragger = (e, title) => {
    const { x, y } = e.target.getBoundingClientRect();
    const { clientX, clientY } = e;

    let crt;
    const crtElements = Array.from(
      document.getElementsByClassName('gantt__row-bars'),
    ).filter(row => row.firstChild);

    if (crtElements.length === 0) return;
    crt = crtElements[0].firstChild;
    if (!crt) return;
    crt = crt.cloneNode(true);
    crt.style.width = '150px';
    crt.className = 'ghost-card';
    const text_to_change = crt.childNodes[0];
    if (text_to_change) text_to_change.innerHTML = title;
    e.target.parentNode.appendChild(crt);
    e.dataTransfer.setDragImage(crt, clientX - x + 30, clientY - y);

    setTimeout(() => crt.parentNode.removeChild(crt), 0);
  };

  const isNotAssigned =
    (action.timeStart === 'Invalid date' &&
      action.timeEnd === 'Invalid date') ||
    (action.timeStart === null && action.timeEnd === null);
  const isCompleted = action.status === 'complete';
  return (
    <div className="action-item">
      <img
        id="drag-action-img"
        src={dots}
        alt=""
        onDragStart={e => dragStart(e, action)}
        onDragEnd={removeGhostElement}
        // draggable={!isCompleted}
      />
      <p>
        {action.goal}{' '}
        {isCompleted ? (
          <span className="scheduled-note">Completed</span>
        ) : !isNotAssigned ? (
          <span className="scheduled-note">Scheduled</span>
        ) : null}
      </p>
    </div>
  );
};

export default ActionItem;
