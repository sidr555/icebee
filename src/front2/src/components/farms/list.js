import { useState, useEffect } from "react";
import FarmListItem from "./list_item";

export default function FarmList() {

  const [farms, setFarms] = useState([]);

  useEffect(() => {
    setFarms([{
      id: 5554,
      type: "hiveos",
      name: "sidr555"
    }]);
  }, [])

    return (
      <div className="card">
        <header className="card-header">
          <p>
            Farm list {farms.length}
          </p>
          <button>Добавить</button>
        </header>
        <body>
          
          { farms.map(farm => <FarmListItem farm={ farm } key={ farm.id }>1</FarmListItem>) }

        </body>
      </div>
    );
  }