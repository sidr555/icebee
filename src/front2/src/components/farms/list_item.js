export default function FarmListItem( { farm } ) {

    return (
      <div className="list-item">
        { farm.id }: { farm.name }  
      </div>
    );
  }