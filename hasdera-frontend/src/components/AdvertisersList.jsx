import React, { useEffect, useState } from "react";
import { getAdvertisers } from "../Services/advertisersService.js";

const AdvertisersList = () => {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdvertisers() {
      try {
        const data = await getAdvertisers();
        setAdvertisers(data);
      } catch (err) {
        console.error("Error fetching advertisers:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdvertisers();
  }, []);

  if (loading) return <p>טוען מפרסמים...</p>;

  return (
    <div>
      <h2>רשימת מפרסמים</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>שם</th>
            <th>חברה</th>
            <th>אימייל</th>
            <th>טלפון</th>
          </tr>
        </thead>
        <tbody>
          {advertisers.map((adv) => (
            <tr key={adv.advertiserId}>
              <td>{adv.advertiserId}</td>
              <td>{adv.name}</td>
              <td>{adv.company}</td>
              <td>{adv.email}</td>
              <td>{adv.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdvertisersList;
