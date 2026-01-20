import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { CalendarDays, BookOpen } from "lucide-react";
import { getIssues } from "../Services/issuesService";
import hasederaTheme from "../styles/HasederaTheme";
import ReaderNav from "./ReaderNav";

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: ${hasederaTheme.colors.text.white};
`;

const Hero = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const HeroText = styled.div`
  flex: 1;
`;

const HeroTitle = styled.h1`
  font-size: 2.2rem;
  margin: 0 0 0.5rem 0;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  opacity: 0.8;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 1.5rem;
  flex: 1;
  min-width: 260px;
`;

const CardTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardButton = styled.button`
  margin-top: 1rem;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  background: ${hasederaTheme.colors.primary.main};
  color: ${hasederaTheme.colors.text.white};
  cursor: pointer;
  font-family: inherit;
`;

const Section = styled.section`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1rem 0;
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const Item = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
`;

export default function ReaderHome() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    (async () => {
      const rows = await getIssues(1, 50, true);
      setIssues(rows);
    })();
  }, []);

  const latestIssue = useMemo(() => {
    if (!issues.length) return null;
    return [...issues].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))[0];
  }, [issues]);

  const openIssue = (it) => {
    if (!it) return;
    navigate(`/issues/${it.issue_id || it.issueId}`, { state: it });
  };

  return (
    <Wrapper>
      <ReaderNav />

      <Hero>
        <HeroText>
          <HeroTitle>ברוכה הבאה אל השדרה</HeroTitle>
          <HeroSubtitle>כל הגיליונות והתכנים במקום אחד, נקי ונעים.</HeroSubtitle>
        </HeroText>
        <Card>
          <CardTitle>
            <BookOpen size={18} />
            הגיליון האחרון
          </CardTitle>
          {latestIssue ? (
            <>
              <div>{latestIssue.title}</div>
              <div style={{ opacity: 0.7, marginTop: "0.5rem" }}>
                <CalendarDays size={16} style={{ marginLeft: 6 }} />
                {new Date(latestIssue.issueDate).toLocaleDateString("he-IL")}
              </div>
              <CardButton onClick={() => openIssue(latestIssue)}>לקריאה</CardButton>
            </>
          ) : (
            <div>אין עדיין גיליונות זמינים.</div>
          )}
        </Card>
      </Hero>

      <Section>
        <SectionTitle>ארכיון מקוצר</SectionTitle>
        <List>
          {issues.slice(0, 6).map((it) => (
            <Item key={it.issue_id || it.issueId} onClick={() => openIssue(it)}>
              <div>{it.title}</div>
              <div style={{ opacity: 0.7, marginTop: "0.5rem" }}>
                {new Date(it.issueDate).toLocaleDateString("he-IL")}
              </div>
            </Item>
          ))}
        </List>
        <CardButton style={{ marginTop: "1rem" }} onClick={() => navigate("/issues")}>
          לכל הארכיון
        </CardButton>
      </Section>
    </Wrapper>
  );
}

