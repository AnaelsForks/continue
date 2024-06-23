import { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import { StyledTooltip, lightGray, vscForeground } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";

const DIAMETER = 6;
const CircleDiv = styled.div<{ color: string }>`
  background-color: ${(props) => props.color};
  box-shadow: 0px 0px 2px 1px ${(props) => props.color};
  width: ${DIAMETER}px;
  height: ${DIAMETER}px;
  border-radius: ${DIAMETER / 2}px;
`;

const ProgressBarWrapper = styled.div`
  width: 100px;
  height: 6px;
  border-radius: 6px;
  border: 0.5px solid ${lightGray};
  margin-top: 6px;
`;

const ProgressBarFill = styled.div<{ completed: number; color?: string }>`
  height: 100%;
  background-color: ${(props) => props.color || vscForeground};
  border-radius: inherit;
  transition: width 0.2s ease-in-out;
  width: ${(props) => props.completed}%;
`;

const GridDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  align-items: center;
  justify-items: center;
  margin-left: 8px;
`;

const P = styled.p`
  margin: 0;
  margin-top: 2px;
  font-size: ${getFontSize() - 2.5}px;
  color: ${lightGray};
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface ProgressBarProps {
  completed: number;
  total: number;
  currentlyIndexing?: string;
  indexingFailed?: boolean;
}

const IndexingProgressBar = ({
  completed,
  total,
  currentlyIndexing,
  indexingFailed = false
}: ProgressBarProps) => {
  const ideMessenger = useContext(IdeMessengerContext);

  const fillPercentage = Math.min(100, Math.max(0, (completed / total) * 100));

  const tooltipPortalDiv = document.getElementById("tooltip-portal-div");

  const [paused, setPaused] = useState<boolean | undefined>(undefined);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    postToIde("index/indexingProgressBarInitialized", {ready:true})
  }, []);
  
  useEffect(() => {
    postToIde("index/setPaused", !expanded);
  }, [expanded]);

  return (
    <div
      onClick={() => {
        if (completed < total) {
          setExpanded((prev) => !prev);
        } else {
          postToIde("index/forceReIndex", undefined);
        }
      }}
      className="cursor-pointer"
    >
      {
        indexingFailed ? ( //red 'failed' dot
        <>
        <CircleDiv data-tooltip-id="indexingFailed_dot" color="#ff0000"></CircleDiv>
        {tooltipPortalDiv &&
          ReactDOM.createPortal(
            <StyledTooltip id="indexingFailed_dot" place="top">
              Codebase not indexed. Click to retry
            </StyledTooltip>,
            tooltipPortalDiv,
          )}
        </>
        ) : completed >= total ? ( //indexing complete green dot
        <>
          <CircleDiv data-tooltip-id="progress_dot" color="#090"></CircleDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="progress_dot" place="top">
                Index up to date. Click to force re-indexing
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      ) : expanded ? ( //progress bar
        <>
          <GridDiv
            data-tooltip-id="usage_progress_bar"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={(e) => {
              ideMessenger.post("index/setPaused", true);
            }}
          >
            <ProgressBarWrapper>
              <ProgressBarFill completed={fillPercentage} />
            </ProgressBarWrapper>
            <P>
              {hovered
                ? "Click to pause"
                : `Indexing (${Math.trunc(indexingState.progress * 100)}%)`}
            </P>
          </GridDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="usage_progress_bar" place="top">
                {indexingState.desc}
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      ) : ( //yellow 'paused' dot
        <>
          <CircleDiv data-tooltip-id="progress_dot" color="#bb0"></CircleDiv>
          {tooltipPortalDiv &&
            ReactDOM.createPortal(
              <StyledTooltip id="progress_dot" place="top">
                Click to unpause indexing (
                {Math.trunc((completed / total) * 100)}%)
              </StyledTooltip>,
              tooltipPortalDiv,
            )}
        </>
      )}
    </div>
  );
};

export default IndexingProgressBar;
